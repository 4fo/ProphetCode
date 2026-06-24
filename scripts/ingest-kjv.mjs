#!/usr/bin/env node

/**
 * KJV Scripture Ingestion Script
 * 
 * Phase 0: Data Ingestion & Infrastructure
 * 
 * This script:
 * 1. Reads the raw KJV verses JSON from kjv-master/json/verses-1769.json
 * 2. Parses and cleans each verse
 * 3. Generates a processed JSON file for the frontend to consume
 * 
 * Usage: node scripts/ingest-kjv.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// Paths
const KJV_JSON_PATH = resolve(PROJECT_ROOT, 'kjv-master', 'json', 'verses-1769.json');
const KJV_LAYOUT_PATH = resolve(PROJECT_ROOT, 'kjv-master', 'json', 'layout-1769.json');
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'public', 'data');
const VERSES_OUTPUT_PATH = resolve(OUTPUT_DIR, 'kjv-verses.json');
const INDEX_OUTPUT_PATH = resolve(OUTPUT_DIR, 'kjv-index.json');

/**
 * Parse a KJV verse reference string like "Genesis 1:1" into components.
 */
function parseRef(ref) {
  const match = /^(.*) (\d+):(\d+)$/.exec(ref.trim());
  if (!match) return null;
  return {
    book: match[1],
    chapter: parseInt(match[2], 10),
    verse: parseInt(match[3], 10),
  };
}

/**
 * Clean verse text: remove # paragraph markers and [] italics markers.
 */
function cleanText(text) {
  return text
    .replace(/^#\s+/, '')
    .replace(/\[/g, '')
    .replace(/\]/g, '')
    .trim();
}

/**
 * Get all unique book names in order from the verses data.
 */
function extractBookList(verses) {
  const bookSet = new Set();
  const bookOrder = [];

  for (const ref of Object.keys(verses)) {
    const parsed = parseRef(ref);
    if (parsed && !bookSet.has(parsed.book)) {
      bookSet.add(parsed.book);
      bookOrder.push(parsed.book);
    }
  }

  return bookOrder;
}

/**
 * Get chapter counts for each book.
 */
function extractChapterCounts(verses) {
  const chapterMap = {};

  for (const ref of Object.keys(verses)) {
    const parsed = parseRef(ref);
    if (parsed) {
      if (!chapterMap[parsed.book]) {
        chapterMap[parsed.book] = new Set();
      }
      chapterMap[parsed.book].add(parsed.chapter);
    }
  }

  const result = {};
  for (const [book, chapters] of Object.entries(chapterMap)) {
    result[book] = Math.max(...chapters);
  }

  return result;
}

/**
 * Get the last verse number for each (book, chapter) pair.
 */
function extractVerseCounts(verses) {
  const verseMap = {};

  for (const ref of Object.keys(verses)) {
    const parsed = parseRef(ref);
    if (parsed) {
      const key = `${parsed.book} ${parsed.chapter}`;
      if (!verseMap[key] || parsed.verse > verseMap[key]) {
        verseMap[key] = parsed.verse;
      }
    }
  }

  return verseMap;
}

function main() {
  console.log('📖 Prophet Code - KJV Scripture Ingestion');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check input file exists
  if (!existsSync(KJV_JSON_PATH)) {
    console.error(`❌ Error: KJV JSON not found at ${KJV_JSON_PATH}`);
    console.error('   Make sure kjv-master is properly installed.');
    process.exit(1);
  }

  // Read and parse the raw KJV JSON
  console.log('📂 Reading KJV verses...');
  const rawData = readFileSync(KJV_JSON_PATH, 'utf-8');
  const versesJson = JSON.parse(rawData);
  const totalVerses = Object.keys(versesJson).length;
  console.log(`   ✅ Found ${totalVerses.toLocaleString()} verses\n`);

  // Process verses into structured format
  console.log('🔄 Processing verses...');
  const processedVerses = [];
  const parsedCount = { valid: 0, skipped: 0 };

  for (const [ref, text] of Object.entries(versesJson)) {
    const parsed = parseRef(ref);
    if (!parsed) {
      parsedCount.skipped++;
      continue;
    }

    processedVerses.push({
      ref,
      book: parsed.book,
      chapter: parsed.chapter,
      verse: parsed.verse,
      text: cleanText(text),
    });

    parsedCount.valid++;
  }

  console.log(`   ✅ ${parsedCount.valid.toLocaleString()} verses processed`);
  if (parsedCount.skipped > 0) {
    console.log(`   ⚠️  ${parsedCount.skipped} references skipped`);
  }

  // Extract book/chapter metadata
  console.log('\n📚 Extracting book and chapter structure...');
  const bookList = extractBookList(versesJson);
  const chapterCounts = extractChapterCounts(versesJson);
  const verseCounts = extractVerseCounts(versesJson);

  console.log(`   ✅ ${bookList.length} books found`);
  for (const book of bookList.slice(0, 5)) {
    console.log(`      - ${book} (${chapterCounts[book] || '?'} chapters)`);
  }
  if (bookList.length > 5) {
    console.log(`      - ... and ${bookList.length - 5} more`);
  }

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write processed verses
  console.log('\n💾 Writing processed data...');
  const outputData = {
    meta: {
      version: '1769',
      source: 'kjv-master',
      totalVerses: processedVerses.length,
      totalBooks: bookList.length,
      generated: new Date().toISOString(),
    },
    books: bookList,
    chapters: chapterCounts,
    verses: verseCounts,
    verseData: processedVerses,
  };

  writeFileSync(VERSES_OUTPUT_PATH, JSON.stringify(outputData));
  const fileSize = (Buffer.byteLength(JSON.stringify(outputData)) / 1024 / 1024).toFixed(1);
  console.log(`   ✅ ${VERSES_OUTPUT_PATH} (${fileSize} MB)`);

  // Write index-only version (lighter for search loading)
  const indexData = {
    meta: outputData.meta,
    books: bookList,
    chapters: chapterCounts,
    verses: verseCounts,
  };

  writeFileSync(INDEX_OUTPUT_PATH, JSON.stringify(indexData));
  const indexSize = (Buffer.byteLength(JSON.stringify(indexData)) / 1024).toFixed(1);
  console.log(`   ✅ ${INDEX_OUTPUT_PATH} (${indexSize} KB)`);

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Ingestion complete!');
  console.log(`   ${processedVerses.length.toLocaleString()} verses`);
  console.log(`   ${bookList.length} books`);
  console.log(`   Total chapters: ${Object.keys(verseCounts).length}`);
  console.log(`   Data size: ${fileSize} MB (full), ${indexSize} KB (index only)`);
}

main();

import MiniSearch from "minisearch";
import type { ScriptureDoc, KJVVerse, ScriptureReference } from "./types";

/**
 * Parse a KJV verse reference string like "Genesis 1:1" into its components.
 */
export function parseKJVReference(ref: string): { book: string; chapter: number; verse: number } | null {
  const match = /^(.*) (\d+):(\d+)$/.exec(ref.trim());
  if (!match) return null;
  return {
    book: match[1],
    chapter: parseInt(match[2], 10),
    verse: parseInt(match[3], 10),
  };
}

/**
 * Clean a KJV verse text: remove '#' paragraph markers and normalize whitespace.
 */
export function cleanVerseText(text: string): string {
  return text
    .replace(/^#\s+/, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .trim();
}

/**
 * Parse the raw KJV verses JSON object into an array of structured KJVVerse objects.
 */
export function parseKJVJson(rawJson: Record<string, string>): KJVVerse[] {
  const verses: KJVVerse[] = [];

  for (const [ref, text] of Object.entries(rawJson)) {
    const parsed = parseKJVReference(ref);
    if (!parsed) continue;

    verses.push({
      reference: ref,
      ...parsed,
      text: cleanVerseText(text),
    });
  }

  return verses;
}

/**
 * Convert KJVVerse objects to ScriptureDoc format for MiniSearch indexing.
 */
export function toScriptureDocs(verses: KJVVerse[]): ScriptureDoc[] {
  return verses.map((v) => ({
    id: v.reference,
    book: v.book,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text,
    fullRef: v.reference,
  }));
}

/**
 * Build a MiniSearch index from an array of ScriptureDocs.
 */
export function buildScriptureIndex(verses: KJVVerse[]): MiniSearch {
  const docs = toScriptureDocs(verses);

  const miniSearch = new MiniSearch({
    fields: ["text", "book", "fullRef"],
    storeFields: ["book", "chapter", "verse", "text", "fullRef"],
    searchOptions: {
      boost: { fullRef: 3, book: 2, text: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  miniSearch.addAll(docs);
  return miniSearch;
}

/**
 * Load a pre-serialized MiniSearch index from a JSON string.
 * This is used for loading indexes built at build time on the client side.
 */
export function loadScriptureIndex(
  serializedIndex: string,
  options?: { fields?: string[]; storeFields?: string[] }
): MiniSearch {
  return MiniSearch.loadJSON(serializedIndex, {
    fields: options?.fields ?? ["text", "book", "fullRef"],
    storeFields: options?.storeFields ?? ["book", "chapter", "verse", "text", "fullRef"],
  });
}

/**
 * Format a ScriptureReference into a human-readable citation string.
 */
export function formatScriptureCitation(ref: ScriptureReference): string {
  if (ref.verse) {
    return `${ref.book} ${ref.chapter}:${ref.verse}`;
  }
  return `${ref.book} ${ref.chapter}`;
}

/**
 * Search the scripture index with a query string.
 * Returns scored and ranked results.
 */
export function searchScripture(
  miniSearch: MiniSearch,
  query: string,
  maxResults = 20
): Array<{ id: string; score: number; terms: string[]; match: Record<string, string[]> } & Record<string, unknown>> {
  if (!query.trim()) return [];
  return miniSearch.search(query, { fuzzy: 0.2, prefix: true, boost: { fullRef: 3, book: 2 } }).slice(0, maxResults);
}

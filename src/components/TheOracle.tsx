"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import MiniSearch from "minisearch";
import type { DigestEntry } from "@/lib/types";

interface TheOracleProps {
  entries: DigestEntry[];
  slices: { id: string }[];
  onNavigate: (sliceIndex: number) => void;
  onClose: () => void;
}

interface SearchResult {
  type: "article" | "scripture";
  label: string;
  subtitle: string;
  section?: string;
  sliceIndex?: number;
}

export default function TheOracle({ entries, slices, onNavigate, onClose }: TheOracleProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [scriptureReady, setScriptureReady] = useState(false);
  const [indexing, setIndexing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const miniRef = useRef<MiniSearch | null>(null);
  const scriptureMapRef = useRef<Map<string, string>>(new Map());

  // Index scripture data on mount (lazy, in background)
  useEffect(() => {
    if (scriptureReady) return;
    setIndexing(true);

    const initScripture = async () => {
      try {
        const resp = await fetch("/ProphetCode/data/kjv-verses.json");
        const data = await resp.json();
        const verses: Array<{ ref: string; book: string; chapter: number; verse: number; text: string }> =
          data.verseData ?? [];

        const mini = new MiniSearch({
          fields: ["text", "book", "ref"],
          storeFields: ["book", "chapter", "verse", "text", "ref"],
          searchOptions: {
            boost: { ref: 3, book: 2, text: 1 },
            prefix: true,
            fuzzy: 0.15,
          },
        });

        const docs = verses.map((v, i) => ({
          id: `s-${i}`,
          ref: v.ref,
          book: v.book,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
        }));

        // Index in batches to avoid blocking the UI
        const batchSize = 5000;
        for (let i = 0; i < docs.length; i += batchSize) {
          mini.addAll(docs.slice(i, i + batchSize));
          await new Promise((r) => setTimeout(r, 0));
        }

        miniRef.current = mini;
        scriptureMapRef.current = new Map(verses.map((v) => [v.ref, v.text]));
        setScriptureReady(true);
        setIndexing(false);
      } catch {
        // Graceful fallback — scripture search won't work but articles still will
        setScriptureReady(false);
        setIndexing(false);
      }
    };

    initScripture();
  }, [scriptureReady]);

  // Run search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIdx(0);
      return;
    }

    const q = query.trim().toLowerCase();
    const found: SearchResult[] = [];
    const seen = new Set<string>();

    // Search digest articles
    for (const entry of entries) {
      const inTitle = entry.title.toLowerCase().includes(q);
      const inContent = entry.content.toLowerCase().includes(q);
      const inTags = entry.tags.some((t) => t.toLowerCase().includes(q));

      if (inTitle || inContent || inTags) {
        const key = `a-${entry.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          // Determine slice index from slices array
          const sliceIdx = slices.findIndex((s) => s.id === entry.timeSliceId);
          found.push({
            type: "article",
            label: entry.title,
            subtitle: entry.content.slice(0, 120).replace(/\n/g, " ") + (entry.content.length > 120 ? "…" : ""),
            section: entry.contentType,
            sliceIndex: sliceIdx >= 0 ? sliceIdx : undefined,
          });
        }
      }
    }

    // Search scriptures via MiniSearch
    if (miniRef.current && scriptureReady) {
      try {
        const hits = miniRef.current.search(q, { fuzzy: 0.15, prefix: true }).slice(0, 8);
        for (const hit of hits) {
          const key = `s-${hit.ref || hit.id}`;
          if (!seen.has(key) && found.length < 20) {
            seen.add(key);
            found.push({
              type: "scripture",
              label: hit.ref as string,
              subtitle: (hit.text as string).slice(0, 120) + ((hit.text as string).length > 120 ? "…" : ""),
            });
          }
        }
      } catch {
        // MiniSearch query failed — skip scripture results
      }
    }

    setResults(found.slice(0, 20));
    setSelectedIdx(0);
  }, [query, entries, scriptureReady]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIdx]) {
        e.preventDefault();
        const result = results[selectedIdx];
        if (result.sliceIndex !== undefined) {
          onNavigate(result.sliceIndex);
        }
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIdx, onNavigate, onClose]
  );

  const articleCount = results.filter((r) => r.type === "article").length;
  const scriptureCount = results.filter((r) => r.type === "scripture").length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-xl mx-4 bg-paper shadow-2xl border border-rule/40 rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-divider">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted/40 shrink-0">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search articles and scriptures…'
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted/40 font-serif outline-none"
          />
          {indexing && (
            <span className="text-[10px] text-muted/30 font-serif animate-pulse">
              Indexing…
            </span>
          )}
          <kbd className="text-[10px] text-muted/30 font-serif border border-rule/30 px-1.5 rounded">
            Esc
          </kbd>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="max-h-[50vh] overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted/50 font-serif italic">
                  {indexing
                    ? "Indexing scriptures… please wait"
                    : "No results found"}
                </p>
              </div>
            ) : (
              <>
                {/* Category summary */}
                <div className="px-4 py-1.5 text-[9px] uppercase tracking-wider text-muted/30 font-serif border-b border-divider/50">
                  {articleCount > 0 && <span>{articleCount} article{articleCount !== 1 ? "s" : ""}</span>}
                  {articleCount > 0 && scriptureCount > 0 && <span> &middot; </span>}
                  {scriptureCount > 0 && <span>{scriptureCount} scripture{scriptureCount !== 1 ? "s" : ""}</span>}
                </div>

                {/* Result items */}
                {results.map((result, i) => (
                  <button
                    key={`${result.type}-${result.label}-${i}`}
                    onClick={() => {
                      if (result.sliceIndex !== undefined) {
                        onNavigate(result.sliceIndex);
                      }
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-2.5 transition-colors ${
                      i === selectedIdx ? "bg-accent-roots/10" : "hover:bg-accent-roots/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Type icon */}
                      <span
                        className={`text-[9px] uppercase tracking-wider font-serif shrink-0 ${
                          result.type === "article" ? "text-accent-roots/60" : "text-accent-echoes/60"
                        }`}
                      >
                        {result.type === "article" ? "ART" : "SCR"}
                      </span>
                      <h4 className="text-sm font-serif font-bold text-ink leading-snug line-clamp-1">
                        {result.label}
                      </h4>
                    </div>
                    <p className="text-xs text-muted/60 font-serif mt-0.5 line-clamp-1 leading-relaxed">
                      {result.subtitle}
                    </p>
                    {result.section && (
                      <p className="text-[9px] uppercase tracking-wider text-muted/40 font-serif mt-0.5">
                        {result.section}
                      </p>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!query.trim() && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted/40 font-serif italic">
              Type to search articles and King James scriptures
            </p>
            <div className="flex justify-center gap-4 mt-3 text-[10px] text-muted/30 font-serif">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>Esc Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

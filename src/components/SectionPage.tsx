"use client";

import { forwardRef, useState, useEffect, useRef } from "react";
import type { TimeSlice, DigestEntry } from "@/lib/types";
import NewspaperArticle from "./NewspaperArticle";

/** Threshold: load content when within 3 viewport-widths of the visible area */
const LOAD_MARGIN = "300% 0px";

interface SectionPageProps {
  slice: TimeSlice;
  entries: DigestEntry[];
}

/** Get era label based on slice id */
function getEraLabel(id: string): string {
  if (id.startsWith("roots")) return "THE ROOTS";
  if (id.startsWith("echoes")) return "THE ECHOES";
  return "THE HORIZON";
}

/** Get era accent color class */
function getAccentClass(id: string): string {
  if (id.startsWith("roots")) return "bg-accent-roots text-accent-roots border-accent-roots";
  if (id.startsWith("echoes")) return "bg-accent-echoes text-accent-echoes border-accent-echoes";
  return "bg-accent-horizon text-accent-horizon border-accent-horizon";
}

const SectionPage = forwardRef<HTMLDivElement, SectionPageProps>(
  function SectionPage({ slice, entries }, ref) {
    const accentClass = getAccentClass(slice.id);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Wait a tick so intersection observer can attach after mount
    const [ready, setReady] = useState(false);
    useEffect(() => {
      setReady(true);
    }, []);

    // IntersectionObserver to lazy-load section content
    useEffect(() => {
      const el = sentinelRef.current;
      if (!el || !ready) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect();
          }
        },
        { rootMargin: LOAD_MARGIN }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [ready]);

    return (
      <div
        ref={ref}
        id={`slice-${slice.id}`}
        data-slice-id={slice.id}
        className="relative w-screen h-screen flex-shrink-0 snap-start overflow-y-auto snap-y overflow-x-hidden"
        style={{
          scrollBehavior: "smooth",
          scrollPaddingTop: "160px",
        }}
      >
        {/* Sentinel element for IntersectionObserver */}
        <div ref={sentinelRef} className="absolute top-0 left-0 w-px h-px" aria-hidden />

        {/* Era banner */}
        <div className="sticky top-0 left-0 right-0 z-30 pt-14 pb-2 px-6 sm:px-12 md:px-16 lg:px-24"
          style={{
            background: "linear-gradient(to bottom, var(--color-paper) 70%, transparent)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-0.5 h-5 ${accentClass.split(" ")[0]}`} />
              <span className={`text-[10px] tracking-[0.35em] font-serif ${accentClass.split(" ")[1]}`}>
                {getEraLabel(slice.id)}
              </span>
              <span className="text-[10px] text-muted/30 font-serif">/</span>
              <span className="text-[10px] tracking-wider text-muted/50 font-serif">
                {slice.label}
              </span>
            </div>
            <h2 className="newspaper-heading text-2xl sm:text-3xl text-ink leading-tight">
              {slice.label}
            </h2>
            {slice.description && (
              <p className="text-xs text-muted/70 font-serif italic mt-1 max-w-2xl leading-relaxed">
                {slice.description}
              </p>
            )}
          </div>
        </div>

        {/* Content: lazy-loaded via IntersectionObserver */}
        {isLoaded ? (
          <>
            {/* Article count badge */}
            <div className="flex justify-end px-6 sm:px-12 md:px-16 lg:px-24 -mt-1 mb-2">
              <span className="text-[10px] tracking-wider text-muted/40 font-serif">
                {entries.length} {entries.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {/* Newspaper columns */}
            <div className="px-6 sm:px-12 md:px-16 lg:px-24 pb-16">
              <div className="max-w-5xl mx-auto newspaper-columns">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <NewspaperArticle key={entry.id} entry={entry} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-sm text-muted/50 font-serif italic">
                      No articles yet for this era.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Lightweight placeholder: match height so scroll positions are reserved */
          <div className="flex items-center justify-center h-[60vh] px-6 sm:px-12 md:px-16 lg:px-24">
            <div className="max-w-5xl mx-auto text-center">
              <div className="w-8 h-px bg-rule/30 mx-auto mb-4" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted/20 font-serif">
                {entries.length} {entries.length === 1 ? "article" : "articles"}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-12 md:px-16 lg:px-24 pb-8">
          <div className="max-w-5xl mx-auto text-center border-t border-rule/30 pt-6">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted/30 font-serif">
              Prophet Code — The Bible Prophesy Dossier
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default SectionPage;

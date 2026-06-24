"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { loadTimelineManifest, getOrderedTimeSlices, getEntriesForSlice } from "@/lib/timeline-manifest";
import type { DigestEntry } from "@/lib/types";

import TimelineTrack from "@/components/TimelineTrack";
import SectionPage from "@/components/SectionPage";
import TheOracle from "@/components/TheOracle";

export default function Home() {
  const manifest = loadTimelineManifest();
  const slices = getOrderedTimeSlices(manifest);
  const totalEntries = manifest.entries.length;

  // Build a map of slice id → entries
  const entriesBySlice = useRef<Record<string, DigestEntry[]>>({});
  if (Object.keys(entriesBySlice.current).length === 0) {
    for (const slice of slices) {
      entriesBySlice.current[slice.id] = getEntriesForSlice(manifest, slice.id);
    }
  }

  // Build a map of slice id → color
  const sectionColors = useRef<Record<string, string>>({});
  for (const slice of slices) {
    sectionColors.current[slice.id] = slice.themeColor;
  }

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [oracleOpen, setOracleOpen] = useState(false);

  // Track active section via scroll proximity
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const totalWidth = container.scrollWidth - container.clientWidth;

    setScrollProgress(totalWidth > 0 ? scrollLeft / totalWidth : 0);

    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < slices.length; i++) {
      const section = sectionRefs.current[i];
      if (!section) continue;

      const sectionCenter = section.offsetLeft + section.offsetWidth / 2;
      const viewportCenter = scrollLeft + window.innerWidth / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    setActiveIndex(closestIndex);
  }, [slices.length]);

  // Scroll to latest section on mount (skip welcome screen)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Wait for DOM to be ready, then jump to the last section
    requestAnimationFrame(() => {
      const lastChild = container.children[slices.length] as HTMLElement | undefined;
      if (lastChild) {
        container.scrollLeft = lastChild.offsetLeft;
      }
      // Trigger active index tracking after positioning
      handleScroll();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Navigate to a specific slice (used by Oracle and keyboard nav)
  // 1. Try sectionRefs first (most reliable)
  // 2. Fall back to container.children
  // 3. Direct scrollLeft assignment avoids CSS smooth-scroll / snap conflicts
  const navigateToSlice = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Prefer sectionRefs — they're the exact elements
    const target = sectionRefs.current[index] ?? (container.children[index + 1] as HTMLElement | undefined);
    
    if (target) {
      const scrollTarget = target.offsetLeft;
      // Assign directly instead of scrollTo({ behavior }) to avoid
      // CSS scroll-behavior: smooth fighting with scroll-snap-type
      container.scrollLeft = scrollTarget;
      // Also dispatch a synthetic scroll event so handleScroll updates activeIndex
      container.dispatchEvent(new Event("scroll"));
    }
  }, []);

  // Keyboard navigation — ArrowLeft/ArrowRight + Ctrl+F for Oracle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = scrollContainerRef.current;

      // Ctrl+F or Cmd+F to open search (standard find shortcut)
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setOracleOpen(true);
        return;
      }
      // / key also opens search (vim-style)
      if (e.key === "/" && !oracleOpen) {
        e.preventDefault();
        setOracleOpen(true);
        return;
      }

      // Only handle arrow navigation when Oracle is closed
      if (oracleOpen) return;
      if (!container) return;

      let targetIndex: number | null = null;
      if (e.key === "ArrowRight") {
        targetIndex = Math.min(activeIndex + 1, slices.length - 1);
      } else if (e.key === "ArrowLeft") {
        targetIndex = Math.max(activeIndex - 1, 0);
      }

      if (targetIndex !== null) {
        e.preventDefault();
        navigateToSlice(targetIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, slices.length, oracleOpen, navigateToSlice]);

  // Derive background color from active section
  const activeSlice = slices[activeIndex];
  const bgColor = activeSlice?.themeColor ?? "#f5f0e8";

  return (
    <div
      className="h-screen overflow-hidden"
      style={{ backgroundColor: bgColor + "08" }}
    >
      {/* Timeline Track */}
      <TimelineTrack
        slices={slices}
        activeIndex={activeIndex}
        scrollContainerRef={scrollContainerRef}
        sectionColors={sectionColors.current}
      />

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x h-screen timeline-scrollbar"
        style={{
          overscrollBehaviorX: "contain",
        }}
      >
        {/* Welcome / Intro Section */}
        <section className="relative w-screen h-screen flex-shrink-0 snap-start flex flex-col items-center justify-center px-6 sm:px-12">
          <div className="max-w-xl text-center">
            <p className="text-[10px] tracking-[0.35em] uppercase text-muted/50 font-serif mb-4">
              Edition I — {totalEntries} Articles
            </p>
            <h1 className="newspaper-headline text-4xl sm:text-5xl md:text-6xl text-ink mb-3 leading-tight">
              Prophet Code
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase text-muted/50 font-serif mb-6">
              The Bible Prophesy Dossier
            </p>
            <p className="text-sm sm:text-base text-muted/70 font-serif italic leading-relaxed max-w-lg mx-auto mb-8">
              An intelligence digest for those monitoring the return of Christ.
              Navigate through history, observe the present, and prepare for what
              lies ahead.
            </p>

            {/* Navigation hint */}
            <div className="flex flex-col items-center gap-3 animate-pulse-slow">
              <span className="text-[9px] tracking-[0.2em] uppercase text-muted/30 font-serif">
                Arrow keys &middot; trackpad &middot; timeline &middot; <span className="text-accent-gold/40">Ctrl+F search</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted/30 rotate-90">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </section>

        {/* Timeline Sections */}
        {slices.map((slice, i) => (
          <SectionPage
            key={slice.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            slice={slice}
            entries={entriesBySlice.current[slice.id] ?? []}
          />
        ))}
      </div>

      {/* Search trigger — prominent pill always visible */}
      <button
        onClick={() => setOracleOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 bg-paper/95 border border-rule/40 rounded-full shadow-lg hover:shadow-xl text-muted/60 hover:text-ink hover:border-accent-gold/50 transition-all duration-200 font-serif backdrop-blur-sm group cursor-pointer"
        aria-label="Open search"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-muted/40 group-hover:text-accent-gold transition-colors shrink-0">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-sm tracking-wide">Search articles &amp; scriptures</span>
        <span className="flex items-center gap-1 ml-2 text-[10px] text-muted/30 border border-rule/20 rounded px-1.5 py-0.5 font-mono">
          <kbd className="text-muted/40">⌘</kbd><kbd className="text-muted/40">F</kbd>
        </span>
      </button>

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-0.5 bg-rule/20">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress * 100}%`,
            backgroundColor: bgColor,
          }}
        />
      </div>

      {/* The Oracle */}
      {oracleOpen && (
        <TheOracle
          entries={manifest.entries}
          slices={slices}
          onNavigate={(sliceIndex: number) => {
            navigateToSlice(sliceIndex);
          }}
          onClose={() => setOracleOpen(false)}
        />
      )}
    </div>
  );
}

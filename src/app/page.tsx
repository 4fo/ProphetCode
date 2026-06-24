"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { loadTimelineManifest, getOrderedTimeSlices, getEntriesForSlice } from "@/lib/timeline-manifest";
import type { DigestEntry } from "@/lib/types";

import TimelineTrack from "@/components/TimelineTrack";
import SectionPage from "@/components/SectionPage";

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

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Keyboard navigation — ArrowLeft/ArrowRight only for horizontal
  // (vertical scroll is handled naturally by each section's scroll area)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      let targetIndex: number | null = null;

      if (e.key === "ArrowRight") {
        targetIndex = Math.min(activeIndex + 1, slices.length - 1);
      } else if (e.key === "ArrowLeft") {
        targetIndex = Math.max(activeIndex - 1, 0);
      }

      if (targetIndex !== null) {
        e.preventDefault();
        const childIndex = targetIndex + 1; // +1 skips welcome section
        const child = container.children[childIndex] as HTMLElement | undefined;
        if (child) {
          container.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, slices.length]);

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
          scrollBehavior: "smooth",
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
                Use arrow keys &middot; trackpad &middot; or timeline above
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

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-0.5 bg-rule/20">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress * 100}%`,
            backgroundColor: bgColor,
          }}
        />
      </div>
    </div>
  );
}

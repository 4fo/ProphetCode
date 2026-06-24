"use client";

import { useCallback, useRef, useEffect, type RefObject } from "react";
import type { TimeSlice } from "@/lib/types";

interface TimelineTrackProps {
  slices: TimeSlice[];
  activeIndex: number;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  sectionColors: Record<string, string>;
}

/** Map section id to CSS accent class */
function getSectionAccent(id: string): string {
  if (id.startsWith("roots")) return "bg-accent-roots text-accent-roots";
  if (id.startsWith("echoes")) return "bg-accent-echoes text-accent-echoes";
  return "bg-accent-horizon text-accent-horizon";
}

function getSectionBg(id: string): string {
  if (id.startsWith("roots")) return "bg-accent-roots/15";
  if (id.startsWith("echoes")) return "bg-accent-echoes/15";
  return "bg-accent-horizon/15";
}

export default function TimelineTrack({
  slices,
  activeIndex,
  scrollContainerRef,
  sectionColors,
}: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback(
    (index: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Use container children directly (index + 1 skips the welcome section)
      const targetIndex = index + 1;
      const children = container.children;
      if (targetIndex < children.length) {
        const section = children[targetIndex] as HTMLElement;
        if (section) {
          container.scrollTo({ left: section.offsetLeft, behavior: "smooth" });
        }
      }
    },
    [scrollContainerRef]
  );

  // Scroll to the first slice of a given era
  const scrollToEra = useCallback(
    (eraPrefix: string) => {
      const idx = slices.findIndex((s) => s.id.startsWith(eraPrefix));
      if (idx >= 0) scrollToSection(idx);
    },
    [slices, scrollToSection]
  );

  // Keep the active dot centered in the track
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const activeDot = track.children[activeIndex] as HTMLElement | undefined;
    if (!activeDot) return;
    activeDot.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  return (
    <div
      ref={trackRef}
      className="fixed top-0 left-0 right-0 z-50 h-14 px-4 sm:px-8 overflow-x-auto timeline-scrollbar"
      style={{
        background: "linear-gradient(to bottom, var(--color-paper) 60%, transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-0 min-w-max">
        {/* Prophet Code — clickable: go to latest */}
        <button
          onClick={() => scrollToSection(slices.length - 1)}
          className="text-[10px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors font-serif w-20 shrink-0 text-left cursor-pointer"
          aria-label="Go to latest"
        >
          Prophet<br />Code
        </button>

        {/* Timeline dots */}
        <div className="flex items-center gap-0 flex-1 justify-center">
          {slices.map((slice, i) => {
            const isActive = i === activeIndex;
            const accent = getSectionAccent(slice.id);
            const bg = getSectionBg(slice.id);

            return (
              <button
                key={slice.id}
                onClick={() => scrollToSection(i)}
                className="relative flex items-center justify-center group cursor-pointer"
                style={{ width: `${100 / slices.length}%`, minWidth: "2rem", maxWidth: "4rem" }}
                aria-label={`Navigate to ${slice.label}`}
              >
                {/* Connecting line */}
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 h-px w-full transition-colors duration-500 ${
                      i <= activeIndex ? "bg-accent-roots/60" : "bg-rule/30"
                    }`}
                    style={{
                      backgroundColor:
                        i <= activeIndex
                          ? sectionColors[slice.id] + "99"
                          : undefined,
                    }}
                  />
                )}

                {/* Dot */}
                <div
                  className={`relative z-10 rounded-full transition-all duration-500 ${
                    isActive
                      ? `w-3 h-3 ${accent.split(" ")[0]}`
                      : "w-1.5 h-1.5 bg-rule/40 group-hover:bg-rule/70"
                  }`}
                />

                {/* Active dot glow */}
                {isActive && (
                  <div
                    className={`absolute z-0 w-6 h-6 rounded-full opacity-20 ${bg}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Era legend — clickable */}
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-serif w-20 shrink-0 justify-end">
          <button
            onClick={() => scrollToEra("roots")}
            className="hidden sm:inline text-muted/50 hover:text-accent-roots transition-colors cursor-pointer"
            aria-label="Navigate to Roots"
          >
            Roots
          </button>
          <span className="text-rule/40 select-none">·</span>
          <button
            onClick={() => scrollToEra("echoes")}
            className="hidden sm:inline text-muted/50 hover:text-accent-echoes transition-colors cursor-pointer"
            aria-label="Navigate to Echoes"
          >
            Echoes
          </button>
          <span className="text-rule/40 select-none">·</span>
          <button
            onClick={() => scrollToEra("horizon")}
            className="hidden sm:inline text-muted/50 hover:text-accent-horizon transition-colors cursor-pointer"
            aria-label="Navigate to Horizon"
          >
            Horizon
          </button>
        </div>
      </div>
    </div>
  );
}

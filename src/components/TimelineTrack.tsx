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
        {/* Section label */}
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted/50 font-serif w-20 shrink-0">
          {slices[activeIndex]?.id.startsWith("roots")
            ? "Ancients"
            : slices[activeIndex]?.id.startsWith("echoes")
            ? "Modern"
            : "Future"}
        </span>

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

        {/* Era legend */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted/50 font-serif w-20 shrink-0 justify-end">
          <span className="hidden sm:inline">Roots</span>
          <span className="text-rule/40">·</span>
          <span className="hidden sm:inline">Echoes</span>
          <span className="text-rule/40">·</span>
          <span className="hidden sm:inline">Horizon</span>
        </div>
      </div>
    </div>
  );
}

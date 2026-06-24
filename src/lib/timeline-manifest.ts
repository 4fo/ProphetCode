import type { TimelineManifest, TimeSlice, DigestEntry } from "./types";
import rawManifest from "@/data/timeline_manifest.json";

/**
 * Load the timeline manifest (parsed from the JSON file at build time).
 */
export function loadTimelineManifest(): TimelineManifest {
  return rawManifest as unknown as TimelineManifest;
}

/**
 * Get all time slices ordered by horizontal position.
 */
export function getOrderedTimeSlices(manifest: TimelineManifest): TimeSlice[] {
  return [...manifest.timeSlices].sort((a, b) => a.horizontalPos - b.horizontalPos);
}

/**
 * Get all entries for a specific time slice, ordered by vertical position.
 */
export function getEntriesForSlice(manifest: TimelineManifest, timeSliceId: string): DigestEntry[] {
  return manifest.entries
    .filter((e) => e.timeSliceId === timeSliceId)
    .sort((a, b) => a.verticalPos - b.verticalPos);
}

/**
 * Get a time slice by its ID.
 */
export function getTimeSliceById(manifest: TimelineManifest, id: string): TimeSlice | undefined {
  return manifest.timeSlices.find((ts) => ts.id === id);
}

/**
 * Get all entries of a specific content type.
 */
export function getEntriesByType(manifest: TimelineManifest, contentType: string): DigestEntry[] {
  return manifest.entries
    .filter((e) => e.contentType === contentType)
    .sort((a, b) => a.verticalPos - b.verticalPos);
}

/**
 * Get the entry count for each content type section.
 */
export function getSectionCounts(manifest: TimelineManifest): {
  roots: number;
  echoes: number;
  horizon: number;
} {
  return {
    roots: manifest.entries.filter((e) => e.contentType === "Root").length,
    echoes: manifest.entries.filter((e) => e.contentType === "Echo").length,
    horizon: manifest.entries.filter((e) => e.contentType === "Horizon").length,
  };
}

/**
 * Determine the content type section for a given horizontal position.
 */
export function getSectionForPosition(horizontalPos: number): "roots" | "echoes" | "horizon" {
  if (horizontalPos < 35) return "roots";
  if (horizontalPos < 80) return "echoes";
  return "horizon";
}

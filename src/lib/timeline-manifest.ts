import type { TimelineManifest, TimeSlice, DigestEntry, Edition } from "./types";
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
 * Get all editions in order.
 */
export function getEditions(manifest: TimelineManifest): Edition[] {
  return manifest.editions;
}

/**
 * Get an edition by ID.
 */
export function getEditionById(manifest: TimelineManifest, id: string): Edition | undefined {
  return manifest.editions.find((e) => e.id === id);
}

/**
 * Get the latest (most recently added) edition.
 */
export function getLatestEdition(manifest: TimelineManifest): Edition {
  return manifest.editions[manifest.editions.length - 1];
}

/**
 * Get all entries for a specific time slice within an edition, ordered by vertical position.
 */
export function getEntriesForSlice(edition: Edition, timeSliceId: string): DigestEntry[] {
  return edition.entries
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
 * Get all entries of a specific content type within an edition.
 */
export function getEntriesByType(edition: Edition, contentType: string): DigestEntry[] {
  return edition.entries
    .filter((e) => e.contentType === contentType)
    .sort((a, b) => a.verticalPos - b.verticalPos);
}

/**
 * Get the entry count for each content type section within an edition.
 */
export function getSectionCounts(edition: Edition): {
  roots: number;
  echoes: number;
  horizon: number;
} {
  return {
    roots: edition.entries.filter((e) => e.contentType === "Root").length,
    echoes: edition.entries.filter((e) => e.contentType === "Echo").length,
    horizon: edition.entries.filter((e) => e.contentType === "Horizon").length,
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

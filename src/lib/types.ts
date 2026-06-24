// TypeScript data models for Prophet Code - The Bible Prophesy Dossier
// Migrated from Rust src/models.rs

export enum ContentType {
  Root = "Root",      // Historical & Foundational
  Echo = "Echo",      // Modern Manifestations
  Horizon = "Horizon", // Prophetic & Future
}

export interface ScriptureReference {
  book: string;
  chapter: number;
  verse?: number;
  /** The full text of the reference (cached for quick display) */
  text: string;
  /** Path to the source file for "Deep Dive" navigation */
  sourcePath: string;
}

export interface TimeSlice {
  id: string;
  label: string;
  /** Represents the horizontal position on the timeline (0.0 = Past, 100.0 = Future) */
  horizontalPos: number;
  themeColor: string;
  description?: string;
}

export interface DigestEntry {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  /** Foreign key to TimeSlice */
  timeSliceId: string;
  /** Represents the vertical position within the time slice (0.0 = Top) */
  verticalPos: number;
  /** List of scripture references linked to this content */
  references: ScriptureReference[];
  tags: string[];
  metadata: Record<string, string>;
}

export interface TimelineManifest {
  timeSlices: TimeSlice[];
  entries: DigestEntry[];
  /** Global index of the Bible books and their markdown paths */
  scriptureIndex: Record<string, string>;
}

/** A KJV verse entry from the raw JSON data */
export interface KJVVerse {
  reference: string;  // e.g. "Genesis 1:1"
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

/** A parsed scripture reference for search indexing */
export interface ScriptureDoc {
  id: string;       // e.g. "Genesis 1:1"
  book: string;
  chapter: number;
  verse: number;
  text: string;
  fullRef: string;  // Human-readable reference
}

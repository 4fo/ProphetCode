use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum ContentType {
    Root,      // Historical & Foundational
    Echo,      // Modern Manifestations
    Horizon,   // Prophetic & Future
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScriptureReference {
    pub book: String,
    pub chapter: u32,
    pub verse: Option<u32>,
    /// The full text of the reference (cached for quick display)
    pub text: String,
    /// Path to the source file for "Deep Dive" navigation
    pub source_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimeSlice {
    pub id: String,
    pub label: String,
    /// Represents the horizontal position on the timeline (0.0 = Past, 100.0 = Future)
    pub horizontal_pos: f32,
    pub theme_color: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DigestEntry {
    pub id: String,
    pub title: String,
    pub content: String,
    pub content_type: ContentType,
    /// Foreign key to TimeSlice
    pub time_slice_id: String,
    /// Represents the vertical position within the time slice (0.0 = Top)
    pub vertical_pos: f32,
    /// List of scripture references linked to this content
    pub references: Vec<ScriptureReference>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimelineManifest {
    pub time_slices: Vec<TimeSlice>,
    pub entries: Vec<DigestEntry>,
    /// Global index of the Bible books and their markdown paths
    pub scripture_index: HashMap<String, String>,
}

impl TimelineManifest {
    /// Helper to get all entries for a specific time slice
    pub fn get_entries_for_slice(&self, time_slice_id: &str) -> Vec<&DigestEntry> {
        self.entries
            .iter()
            .filter(|e| e.time_slice_id == time_slice_id)
            .collect()
    }
}

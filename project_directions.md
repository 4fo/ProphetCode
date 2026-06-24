# Project Directions: Prophet Code Digest UI

## Core Vision
A high-end, newspaper-style "Intelligence Digest" for the Prophet Code project.

## UX / Navigation Model
- **Horizontal Axis:** Timeline navigation.
    - **Left:** The Past (Historical context, "The Roots").
    - **Center:** The Present (Modern manifestations, "The Echoes").
    - **Right:** The Future (Prophetic anticipation, "The Horizon").
- **Vertical Axis:** Content exploration within a specific point in time.
    - Users scroll up and down to navigate articles/sections within the current timeline slice.

## Visual Identity
- **Style:** Traditional newspaper layout, beautiful typography (Serif fonts for body, high-quality headers).
- **Layout:** Multi-column flow, dense but readable.
- **Transitions:** Smooth visual shifts between the "Roots", "Echoes", and "Horizon" as the horizontal scroll position changes.

## Tech Stack (Proposed)
- **Language:** Rust
- **Frontend:** Leptos or Dioxus (Wasm-based)
- **Styling:** Tailwind CSS + Custom CSS for typesetting.
- **Deployment:** TBD (Web / Tauri / Desktop)

## Progress Tracking
- [ ] Data Modeling (Mapping "Roots/Echoes/Horizon" to Rust structs)
- [ ] Initial UI Skeleton (Grid setup for horizontal/vertical scrolling)
- [ ] Typography & Layout Refinement
- [ ] Data Integration

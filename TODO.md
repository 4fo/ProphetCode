# Implementation Roadmap

## Phase 0: Data Ingestion & Infrastructure
- [ ] **Scripture Indexing:** Parse `/Users/jva/Documents/KJV/KJV Data/kjv-markdown-master` to build the `scripture_index`.
- [ ] **Vector Generation:** Generate embeddings for KJV verses and Digest content (Offline process).
- [ ] **Database Setup:** Initialize a local vector store/index for "The Oracle" search.
- [ ] **Dataset Preparation:** Create a seed `timeline_manifest.json` with initial content for "Roots", "Echoes", and "Horizon".

## Phase 1: Foundation & Data Modeling
- [ ] Define Rust Structs for `Article`, `TimeSlice`, and `DigestEntry` (Completed).
- [ ] Set up Axum backend with basic "Timeline Manifest" endpoint.
- [ ] Initialize Leptos project and configure Tailwind CSS.

## Phase 2: Navigation & Layout (The "Newspaper")
- [ ] Implement the Horizontal Scroll Manager (the Timeline).
- [ ] Create the "Newspaper" Grid layout (multi-column, serif typography).
- [ ] Implement "Sticky Headers" for vertical article navigation.
- [ ] Develop the visual "Shift" logic (style changes based on scroll position).

## Phase 3: Content Integration
- [ ] Connect Frontend to the Backend API.
- [ ] Implement Lazy Loading for off-screen articles.
- [ ] Add "Pull-quote" and "Sidebar" components.
- [ ] **The Oracle:** Integrate Hybrid Search (BM25 + Vector).

## Phase 4: Polishing & Optimization
- [ ] Refine typography and hyphenation.
- [ ] Add smooth-scroll interpolation.
- [ ] Performance audit (Wasm bundle size, render cycles).
- [ ] Final "Hand-off" documentation review.

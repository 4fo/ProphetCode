# Build Specification: Prophet Code - The Bible Prophesy Dossier

## 1. Project Vision & Context
The goal is to build a high-end, "Intelligence Digest" web platform. It is not a standard blog or a database; it is a **curated, chronological intelligence map** of prophetic history, modern manifestations, and future anticipation.

**Core Aesthetic:** Traditional print newspaper. High-quality typography. Dense, authoritative, and intellectually rigorous.

## 2. Technical Stack (Mandatory)
- **Language:** Rust
- **Frontend:** Leptos (Wasm)
- **Styling:** Tailwind CSS + Custom CSS for advanced typography (hyphenation, justification).
- **Backend:** Axum (Rust)
- **Database:** SQLite (for scripture indexing) + Vector Store (for "The Oracle" search).

## 3. Core UI/UX Mechanics (Dual-Axis Navigation)
The agent must implement a dual-axis navigation system:
- **Horizontal Axis (The Timeline):**
    - Users scroll horizontally to navigate "Time."
    - **Left:** "The Roots" (Historical/Foundational).
    - **Center:** "The Echoes" (Modern Manifestations).
    - **Right:** "The Horizon" (Prophetic/Future).
- **Vertical Axis (The Content):**
    - Within any horizontal time slice, users scroll vertically to read articles.
    - Layout must resemble a multi-column newspaper.

## 4. Data Schema & Models
The builder agent must implement the following Rust structures:

### TimeSlice
- `id`: Unique Identifier
- `label`: e.g., "Ancient Era", "Modern Day"
- `horizontal_pos`: float (0.0 to 100.0)
- `theme_color`: Hex code for visual shifting.

### DigestEntry
- `id`: Unique Identifier
- `title`: String
- `content`: String (Markdown supported)
- `content_type`: Enum (Root, Echo, Horizon)
- `time_slice_id`: Link to TimeSlice
- `vertical_pos`: float (order within the slice)
- `references`: Vec<ScriptureReference>

### ScriptureReference
- `book`, `chapter`, `verse`: Fields for KJV citation.
- `text`: The raw KJV text for immediate display.
- `source_path`: Path to the markdown source file for "Deep Dives."

## 5. The "Oracle" (Search Engine)
The search must be "Buttery Smooth" and support natural language.
- **Hybrid Search:** Implement a system that combines **BM25 (Keyword)** and **Vector Embeddings (Semantic)**.
- **Interaction:** Searching should "filter" the newspaper. The timeline should glide to the relevant time slice automatically.
- **Performance:** Query results must be returned in <50ms.

## 6. Execution Roadmap (Instructions for the Builder Agent)

### Phase 0: Data Ingestion & Infrastructure
1. Parse `/KJV Data/kjv-markdown-master` to create a searchable SQLite index and a vector embedding map.
2. Create a `timeline_manifest.json` containing seed data for "Roots", "Echoes", and "Horizon".

### Phase 1: Backend & API
1. Build an Axum server to serve the `TimelineManifest`.
2. Create an endpoint for "The Oracle" search that queries the hybrid index.

### Phase 2: Frontend Core & Navigation
1. Initialize Leptos with a horizontal "Timeline Manager."
2. Implement the "Newspaper Grid" layout with multi-column reflow.
3. Implement "Sticky Headers" for vertical navigation.

### Phase 3: Content & Integration
1. Connect the Frontend to the Axum API.
2. Implement "Lazy Loading" for articles outside the current viewport.
3. Create "Pull-quote" and "Sidebar" components.

### Phase 4: Polish & Typography
1. Fine-tune CSS for professional typesetting (hyphenation, justified text).
2. Add "Smooth-scroll" interpolation for horizontal timeline movement.
3. Performance audit of the Wasm bundle.

# System Architecture: The Dual-Axis Digest (Updated)

## Data Flow
1. **Source Data:** 
    - **Content:** Raw "Roots", "Echoes", and "Horizon" analysis.
    - **Scripture:** The KJV Bible (Ingested from local `/KJV Data`).
2. **The Oracle (Search Engine):**
    - **Hybrid Search:** Combines BM25 (keyword matching) with Vector Embeddings (semantic/natural language matching).
    - **Embedding Pipeline:** An offline process converts Bible verses and Digest entries into high-dimensional vectors.
    - **Fast Retrieval:** Uses a local vector index (e.g., `Faiss` or a custom Rust implementation) for <50ms query response.
3. **Backend (Axum):** 
    - Parses content and categorizes it by "Time Slice".
    - Serves the "Timeline Manifest" and "Search Queries".
4. **Frontend (Leptos):**
    - **Timeline Manager:** Tracks `current_time_offset`.
    - **Viewport Resolver:** Determines which articles are "in-view".
    - **Search Lens:** Listens to the "Oracle" and applies filters/animations to the active viewport.

## Scripture Integration
- **Reference Linking:** Every `DigestEntry` can contain multiple `ScriptureReference` objects.
- **Deep Dives:** Clicking a reference in the "Echoes" (Modern) section will dynamically navigate the user to the corresponding "Roots" (Historical) section or open a "Deep Dive" modal showing the original KJV text.

## State Management
- **Global State:** `current_time_offset` (float) - drives the horizontal scroll.
- **Local State:** `article_scroll_offset` (float) - drives the vertical scroll of the currently active article.

## Performance Strategy
- **Lazy Loading:** Only render articles that are within a ±20% buffer of the current horizontal position.
- **Virtualization:** If an article is extremely long vertically, use a virtual list to render only what is visible.
- **Search Caching:** Recent and trending queries are cached locally in the browser for "buttery smooth" repetition.

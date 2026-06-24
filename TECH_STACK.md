# Tech Stack: Web Architecture

## Language & Frameworks
- **Language:** Rust
- **Frontend Framework:** Leptos (High-performance, fine-grained reactivity)
- **Styling:** Tailwind CSS (Layout) + Custom CSS (Advanced Typography)
- **WebAssembly:** Compiled to Wasm for high-performance UI rendering.

## Infrastructure
- **Backend:** Axum (Rust) - To serve content via JSON API.
- **State Management:** Leptos Signals (to track horizontal scroll position and active articles).
- **Deployment:** Vercel / Netlify (for the frontend) + Fly.io / Railway (for the Rust backend).

## Key Libraries
- **Serde:** For seamless JSON serialization between backend and frontend.
- **Web-sys / Gloo:** For direct browser API access (handling scroll events and smooth-scroll logic).
- **Fontsource:** For managing high-quality local-style web fonts.

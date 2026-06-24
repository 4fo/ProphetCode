import { loadTimelineManifest, getSectionCounts } from "@/lib/timeline-manifest";
import Link from "next/link";

export default function Home() {
  const manifest = loadTimelineManifest();
  const counts = getSectionCounts(manifest);

  return (
    <div className="min-h-screen">
      {/* ─── Masthead ─── */}
      <header className="border-b border-rule pb-6 pt-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3 font-serif">
            Intelligence Digest
          </p>
          <h1 className="newspaper-headline text-5xl sm:text-6xl md:text-7xl text-ink mb-2">
            Prophet Code
          </h1>
          <p className="text-lg text-muted font-serif italic max-w-2xl mx-auto leading-relaxed">
            Tracking the signs of the times through Scripture, history, and the
            unfolding of biblical prophecy.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs uppercase tracking-widest text-muted font-serif">
            <span>Edition I</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
            <span>•</span>
            <span>{counts.roots + counts.echoes + counts.horizon} Articles</span>
          </div>
        </div>
      </header>

      {/* ─── Navigation Sections ─── */}
      <nav className="border-b border-rule">
        <div className="max-w-7xl mx-auto flex justify-center gap-8 sm:gap-16 px-4 py-3 text-sm font-serif">
          <Link
            href="#roots"
            className="tracking-wider text-accent-roots hover:text-accent-roots/80 transition-colors uppercase"
          >
            The Roots
          </Link>
          <Link
            href="#echoes"
            className="tracking-wider text-accent-echoes hover:text-accent-echoes/80 transition-colors uppercase"
          >
            The Echoes
          </Link>
          <Link
            href="#horizon"
            className="tracking-wider text-accent-horizon hover:text-accent-horizon/80 transition-colors uppercase"
          >
            The Horizon
          </Link>
        </div>
      </nav>

      {/* ─── Main Content Area ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Roots Section */}
        <section id="roots" className="mb-12">
          <div className="flex items-center gap-3 mb-6 sticky-header">
            <div className="w-1 h-8 bg-accent-roots" />
            <div>
              <h2 className="newspaper-heading text-2xl sm:text-3xl text-accent-roots">
                The Roots
              </h2>
              <p className="text-sm text-muted font-serif italic">
                Historical &amp; Foundational Context
              </p>
            </div>
          </div>
          <div className="newspaper-columns">
            {manifest.entries
              .filter((e) => e.contentType === "Root")
              .sort((a, b) => a.verticalPos - b.verticalPos)
              .map((entry) => (
                <article key={entry.id} className="article-card">
                  <h3 className="newspaper-heading text-lg font-bold mb-1 leading-snug">
                    {entry.title}
                  </h3>
                  <div className="text-xs text-muted mb-2 font-serif uppercase tracking-wider">
                    {manifest.timeSlices
                      .find((ts) => ts.id === entry.timeSliceId)
                      ?.label ?? ""}
                  </div>
                  <div className="newspaper-body text-sm leading-relaxed">
                    {entry.content.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {entry.references.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-divider">
                      <p className="text-xs font-serif italic text-muted">
                        Scriptures:{" "}
                        {entry.references
                          .map((ref) => `${ref.book} ${ref.chapter}:${ref.verse}`)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </article>
              ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Echoes Section */}
        <section id="echoes" className="mb-12">
          <div className="flex items-center gap-3 mb-6 sticky-header">
            <div className="w-1 h-8 bg-accent-echoes" />
            <div>
              <h2 className="newspaper-heading text-2xl sm:text-3xl text-accent-echoes">
                The Echoes
              </h2>
              <p className="text-sm text-muted font-serif italic">
                Modern Manifestations &amp; Current Events
              </p>
            </div>
          </div>
          <div className="newspaper-columns">
            {manifest.entries
              .filter((e) => e.contentType === "Echo")
              .sort((a, b) => a.verticalPos - b.verticalPos)
              .map((entry) => (
                <article key={entry.id} className="article-card">
                  <h3 className="newspaper-heading text-lg font-bold mb-1 leading-snug">
                    {entry.title}
                  </h3>
                  <div className="text-xs text-muted mb-2 font-serif uppercase tracking-wider">
                    {manifest.timeSlices
                      .find((ts) => ts.id === entry.timeSliceId)
                      ?.label ?? ""}
                  </div>
                  <div className="newspaper-body text-sm leading-relaxed">
                    {entry.content.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {entry.references.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-divider">
                      <p className="text-xs font-serif italic text-muted">
                        Scriptures:{" "}
                        {entry.references
                          .map((ref) => `${ref.book} ${ref.chapter}:${ref.verse}`)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </article>
              ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Horizon Section */}
        <section id="horizon" className="mb-12">
          <div className="flex items-center gap-3 mb-6 sticky-header">
            <div className="w-1 h-8 bg-accent-horizon" />
            <div>
              <h2 className="newspaper-heading text-2xl sm:text-3xl text-accent-horizon">
                The Horizon
              </h2>
              <p className="text-sm text-muted font-serif italic">
                Prophetic &amp; Future Focus
              </p>
            </div>
          </div>
          <div className="newspaper-columns">
            {manifest.entries
              .filter((e) => e.contentType === "Horizon")
              .sort((a, b) => a.verticalPos - b.verticalPos)
              .map((entry) => (
                <article key={entry.id} className="article-card">
                  <h3 className="newspaper-heading text-lg font-bold mb-1 leading-snug">
                    {entry.title}
                  </h3>
                  <div className="text-xs text-muted mb-2 font-serif uppercase tracking-wider">
                    {manifest.timeSlices
                      .find((ts) => ts.id === entry.timeSliceId)
                      ?.label ?? ""}
                  </div>
                  <div className="newspaper-body text-sm leading-relaxed">
                    {entry.content.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {entry.references.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-divider">
                      <p className="text-xs font-serif italic text-muted">
                        Scriptures:{" "}
                        {entry.references
                          .map((ref) => `${ref.book} ${ref.chapter}:${ref.verse}`)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </article>
              ))}
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-rule mt-12 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-2 font-serif">
            Prophet Code — The Bible Prophesy Dossier
          </p>
          <p className="text-xs text-muted/60 font-serif italic">
            &ldquo;Watch therefore, for ye know not what hour your Lord doth come.&rdquo;
            <br />
            <span className="not-italic">— Matthew 24:42</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

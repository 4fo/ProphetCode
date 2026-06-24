import type { DigestEntry } from "@/lib/types";
import PullQuote from "./PullQuote";
import Sidebar from "./Sidebar";

interface NewspaperArticleProps {
  entry: DigestEntry;
}

/** Map contentType to sidebar accent */
function getAccentForType(contentType: string): "roots" | "echoes" | "horizon" {
  if (contentType === "Root") return "roots";
  if (contentType === "Echo") return "echoes";
  return "horizon";
}

export default function NewspaperArticle({ entry }: NewspaperArticleProps) {
  const accent = getAccentForType(entry.contentType);
  const contentParagraphs = entry.content.split("\n\n");

  return (
    <article className="article-card snap-start min-h-0 py-[6px] first:pt-0 last:pb-0">
      {/* Title */}
      <h3 className="newspaper-heading text-lg font-bold mb-0.5 leading-snug text-ink">
        {entry.title}
      </h3>

      {/* Tags line */}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {entry.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase tracking-wider text-muted/50 font-serif"
          >
            {tag}
            {entry.tags.indexOf(tag) < Math.min(entry.tags.length, 4) - 1 && (
              <span className="ml-1.5 text-rule/50">·</span>
            )}
          </span>
        ))}
      </div>

      {/* Content with optional PullQuote and Sidebar interspersed */}
      <div className="newspaper-body text-sm leading-relaxed text-ink/85">
        {contentParagraphs.map((paragraph, i) => {
          const elements: React.ReactNode[] = [];

          // Render paragraph
          const rendered = paragraph
            .split(/(\*\*[^*]+\*\*)/g)
            .map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={j} className="font-bold text-ink">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith("- ")) {
                return null;
              }
              return part;
            });

          if (paragraph.trim().startsWith("- ")) {
            elements.push(
              <ul key={`p-${i}`} className="mb-2 last:mb-0 list-disc list-inside space-y-0.5">
                {paragraph.split("\n").map((line, li) => {
                  const text = line.replace(/^-\s+/, "");
                  return (
                    <li key={li} className="text-sm text-ink/80">
                      {text}
                    </li>
                  );
                })}
              </ul>
            );
          } else {
            elements.push(
              <p key={`p-${i}`} className="mb-2 last:mb-0">
                {rendered}
              </p>
            );
          }

          // Insert pull-quote after this paragraph if specified
          if (entry.pullQuote && entry.pullQuote.afterParagraph === i) {
            elements.push(
              <PullQuote
                key={`pq-${i}`}
                text={entry.pullQuote.text}
                attribution={entry.pullQuote.attribution}
              />
            );
          }

          // Insert sidebar after this paragraph if specified
          if (entry.sidebar && entry.sidebar.afterParagraph === i) {
            elements.push(
              <Sidebar
                key={`sb-${i}`}
                title={entry.sidebar.title}
                accent={entry.sidebar.accent ?? accent}
              >
                {entry.sidebar.content.split("\n\n").map((para, pi) => (
                  <p key={pi}>{para}</p>
                ))}
              </Sidebar>
            );
          }

          return elements;
        })}
      </div>

      {/* Scripture References - with verse text */}
      {entry.references.length > 0 && (
        <div className="mt-2 pt-2 border-t border-divider space-y-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted/50 font-serif">
            Scripture References
          </p>
          {entry.references.map((ref, i) => (
            <div key={i} className="pl-2.5 border-l-2 border-accent-gold/30">
              <span className="text-[11px] font-bold text-accent-roots/80 font-serif">
                {ref.book} {ref.chapter}:{ref.verse}
              </span>
              <p className="text-[12px] leading-relaxed text-ink/70 font-serif mt-0.5">
                &ldquo;{ref.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

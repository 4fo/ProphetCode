import type { DigestEntry } from "@/lib/types";

interface NewspaperArticleProps {
  entry: DigestEntry;
}

export default function NewspaperArticle({ entry }: NewspaperArticleProps) {
  return (
    <article className="article-card snap-start min-h-0 py-3 first:pt-0 last:pb-0">
      {/* Title */}
      <h3 className="newspaper-heading text-lg font-bold mb-1 leading-snug text-ink">
        {entry.title}
      </h3>

      {/* Tags line */}
      <div className="flex flex-wrap gap-1.5 mb-3">
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

      {/* Content */}
      <div className="newspaper-body text-sm leading-relaxed text-ink/85">
        {entry.content.split("\n\n").map((paragraph, i) => {
          // Handle bold markdown **text**
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
              // Handle bullet list items
              if (part.startsWith("- ")) {
                return null; // We'll handle this differently
              }
              return part;
            });

          // Check if this paragraph is a bullet list
          if (paragraph.trim().startsWith("- ")) {
            return (
              <ul key={i} className="mb-3 last:mb-0 list-disc list-inside space-y-1">
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
          }

          return (
            <p key={i} className="mb-3 last:mb-0">
              {rendered}
            </p>
          );
        })}
      </div>

      {/* Scripture References */}
      {entry.references.length > 0 && (
        <div className="mt-3 pt-2 border-t border-divider">
          <p className="text-[11px] font-serif italic text-muted/70 mb-1">
            Scripture References
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {entry.references.map((ref, i) => (
    <span
                key={i}
                className="group inline-flex items-baseline gap-0.5 text-xs text-accent-roots/70 hover:text-accent-roots transition-colors font-serif italic cursor-default"
                title={ref.text}
              >
                {ref.book} {ref.chapter}:{ref.verse}
                <span className="inline-block max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 align-middle">
                  <span className="pl-1 text-[10px] text-muted/40 normal-case not-italic">
                    {ref.text.slice(0, 60)}&hellip;
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

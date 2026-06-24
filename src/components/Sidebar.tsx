import type { ReactNode } from "react";

interface SidebarProps {
  title: string;
  children: ReactNode;
  accent?: "roots" | "echoes" | "horizon";
}

const accentBorders = {
  roots: "border-accent-roots/30",
  echoes: "border-accent-echoes/30",
  horizon: "border-accent-horizon/30",
};

const accentHeaders = {
  roots: "text-accent-roots border-accent-roots/40",
  echoes: "text-accent-echoes border-accent-echoes/40",
  horizon: "text-accent-horizon border-accent-horizon/40",
};

/** A sidebar callout box for additional context, stats, or related content. */
export default function Sidebar({ title, children, accent = "roots" }: SidebarProps) {
  return (
    <aside
      className={`my-5 p-4 border-l-2 ${accentBorders[accent]} bg-ink/[0.02] rounded-sm`}
    >
      <h4
        className={`text-[10px] uppercase tracking-[0.25em] font-serif pb-1.5 mb-2 border-b ${accentHeaders[accent]}`}
      >
        {title}
      </h4>
      <div className="text-xs text-muted/80 font-serif leading-relaxed space-y-2">
        {children}
      </div>
    </aside>
  );
}

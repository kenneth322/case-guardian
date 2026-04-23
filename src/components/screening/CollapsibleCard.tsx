import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleCard({ title, summary, children, defaultOpen }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border bg-surface shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
      >
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <div className="flex items-center gap-3">{summary}</div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

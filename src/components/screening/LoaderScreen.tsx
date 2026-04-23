import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface Props {
  onDone: () => void;
}

const MESSAGES = [
  "Fetching Bureau Risk Alerts",
  "Consolidating Telco Data",
  "Analyzing Digital Footprint",
];

const TOTAL_MS = 10_000;
const STEP_MS = 2200;

export default function LoaderScreen({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / TOTAL_MS) * 100));
    }, 80);
    const cycle = window.setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, STEP_MS);
    const done = window.setTimeout(onDone, TOTAL_MS);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(cycle);
      window.clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-[pulse-ring_1.8s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-[pulse-ring_1.8s_ease-out_infinite] [animation-delay:600ms]" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>

        <h2 className="text-lg font-semibold tracking-tight">Screening in Progress</h2>

        <div className="relative mt-3 h-7 overflow-hidden">
          {MESSAGES.map((m, i) => (
            <p
              key={m}
              className={`absolute inset-0 text-sm text-muted-foreground transition-all duration-500 ${
                i === idx ? "translate-y-0 opacity-100" : i < idx ? "-translate-y-3 opacity-0" : "translate-y-3 opacity-0"
              }`}
            >
              {m}…
            </p>
          ))}
        </div>

        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {MESSAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === idx ? "bg-primary scale-125" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

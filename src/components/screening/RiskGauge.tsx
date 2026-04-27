import type { RiskLevel, SummaryRisk } from "@/data/cases";
import { SUMMARY_TO_LEVEL } from "@/data/cases";

interface Props {
  /** Either a normalized RiskLevel or the raw summary string from the dataset. */
  risk: RiskLevel | SummaryRisk | null;
  noHit?: boolean;
}

// Maps risk level to needle angle (-90 = far left, +90 = far right)
const ANGLES: Record<RiskLevel, number> = {
  Low: -67,
  Medium: -22,
  High: 22,
  "Very High": 67,
};

function toLevel(r: RiskLevel | SummaryRisk): RiskLevel {
  if (r in SUMMARY_TO_LEVEL) return SUMMARY_TO_LEVEL[r as SummaryRisk];
  return r as RiskLevel;
}

export default function RiskGauge({ risk, noHit }: Props) {
  const level: RiskLevel | null = noHit || !risk ? null : toLevel(risk);
  const angle = level ? ANGLES[level] : 0;
  const cx = 150;
  const cy = 150;
  const r = 110;

  const seg = (startDeg: number, endDeg: number, color: string) => {
    const toRad = (d: number) => ((d - 180) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth={26}
        fill="none"
        strokeLinecap="butt"
      />
    );
  };

  const segColor = (key: "low" | "medium" | "high" | "veryhigh") => {
    if (noHit) return "var(--risk-neutral)";
    // Dial-only override: render the 3rd (High) segment in orange,
    // independent of the global --risk-high token used elsewhere.
    if (key === "high") return "oklch(0.72 0.18 55)";
    return `var(--risk-${key})`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 180" className="w-full max-w-[340px]">
        {seg(0, 45, segColor("low"))}
        {seg(45, 90, segColor("medium"))}
        {seg(90, 135, segColor("high"))}
        {seg(135, 180, segColor("veryhigh"))}

        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - 90}
            stroke="var(--color-foreground)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={9} fill="var(--color-foreground)" />
          <circle cx={cx} cy={cy} r={4} fill="var(--color-surface)" />
        </g>
      </svg>

      <div className="-mt-4 text-center">
        {noHit || !level ? (
          <>
            <div className="text-3xl font-bold tabular-nums text-muted-foreground">—</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              No Hit
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold">{level}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              Risk Area
            </div>
          </>
        )}
      </div>
    </div>
  );
}

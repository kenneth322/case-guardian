import type { RiskLevel } from "@/data/cases";

interface Props {
  risk: RiskLevel | null;
  score: number | null;
  noHit?: boolean;
}

// Maps risk level to needle angle (-90 = far left, +90 = far right)
const ANGLES: Record<RiskLevel, number> = {
  Low: -67,
  Medium: -22,
  High: 22,
  "Very High": 67,
};

export default function RiskGauge({ risk, score, noHit }: Props) {
  const angle = noHit || !risk ? 0 : ANGLES[risk];
  const cx = 150;
  const cy = 150;
  const r = 110;

  // 4 segments across 180deg arc, each 45deg
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

  const segColor = (key: "low" | "medium" | "high" | "veryhigh") =>
    noHit ? "var(--risk-neutral)" : `var(--risk-${key})`;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 180" className="w-full max-w-[340px]">
        {seg(0, 45, segColor("low"))}
        {seg(45, 90, segColor("medium"))}
        {seg(90, 135, segColor("high"))}
        {seg(135, 180, segColor("veryhigh"))}

        {/* Tick labels */}
        <text x="20" y="170" fontSize="10" fill="var(--color-muted-foreground)">Low</text>
        <text x="92" y="40" fontSize="10" fill="var(--color-muted-foreground)">Med</text>
        <text x="180" y="40" fontSize="10" fill="var(--color-muted-foreground)">High</text>
        <text x="245" y="170" fontSize="10" fill="var(--color-muted-foreground)">V.High</text>

        {/* Needle */}
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
        {noHit ? (
          <>
            <div className="text-3xl font-bold tabular-nums text-muted-foreground">—</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              No Hit
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold tabular-nums">
              {score}
              <span className="text-base font-normal text-muted-foreground">/100</span>
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              Overall Score
            </div>
          </>
        )}
      </div>
    </div>
  );
}

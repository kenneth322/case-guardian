import rawData from "./lovable_variant2_ranked_topN.json";

// ---- Types ----
export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

// Summary strings as they appear in the source JSON
export type SummaryRisk = "Low Risk" | "Average Risk" | "High Risk" | "Very High Risk";

export interface Applicant {
  mobile: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  aadhaar: string;
  pan: string;
  address: string;
}

export interface Summary {
  telcoRisk: SummaryRisk;
  bureauRisk: SummaryRisk;
  digitalRisk: SummaryRisk;
  overallRisk: SummaryRisk;
}

export interface Factor {
  key: string;
  label: string;
  value: number | string;
}

export interface SectionResult {
  topN: number;
  topFactors: Factor[];
  factors: Factor[];
  metadata?: { modelScores?: { Predicted?: number; Scaled_Score?: number } };
}

export interface CaseRecord {
  applicant: Applicant;
  summary: Summary;
  results: {
    bureau: SectionResult;
    telco: SectionResult;
    digital: SectionResult;
  };
}

// ---- Helpers ----
export const SUMMARY_TO_LEVEL: Record<SummaryRisk, RiskLevel> = {
  "Low Risk": "Low",
  "Average Risk": "Medium",
  "High Risk": "High",
  "Very High Risk": "Very High",
};

const HIDDEN_KEY_TOKENS = ["predicted", "scaled_score"];

/** Strip any model-output style entries that should never appear in the UI. */
function sanitizeFactors(factors: Factor[] = []): Factor[] {
  return factors.filter((f) => {
    const k = (f.key || "").toLowerCase();
    const l = (f.label || "").toLowerCase();
    return !HIDDEN_KEY_TOKENS.some((t) => k.includes(t) || l.includes(t));
  });
}

// ---- Load + freeze cases ----
type RawShape = {
  lovable: {
    dataModel: {
      entities: {
        casesByMobile: Record<string, CaseRecord>;
      };
    };
  };
};

const rawCases = (rawData as unknown as RawShape).lovable.dataModel.entities.casesByMobile;

export const CASES_BY_MOBILE: Record<string, CaseRecord> = Object.fromEntries(
  Object.entries(rawCases).map(([mobile, c]) => [
    mobile,
    {
      ...c,
      results: {
        bureau: {
          ...c.results.bureau,
          topFactors: sanitizeFactors(c.results.bureau.topFactors),
          factors: sanitizeFactors(c.results.bureau.factors),
        },
        telco: {
          ...c.results.telco,
          topFactors: sanitizeFactors(c.results.telco.topFactors),
          factors: sanitizeFactors(c.results.telco.factors),
        },
        digital: {
          ...c.results.digital,
          topFactors: sanitizeFactors(c.results.digital.topFactors),
          factors: sanitizeFactors(c.results.digital.factors),
        },
      },
    },
  ]),
);

export const DEMO_MOBILES: string[] = Object.keys(CASES_BY_MOBILE);

/** Format factor numeric values for display. */
export function formatFactorValue(v: number | string): string {
  if (typeof v === "string") return v;
  if (!Number.isFinite(v)) return String(v);
  if (Number.isInteger(v)) {
    // Compact for very large integers
    if (Math.abs(v) >= 1_000_000) return v.toLocaleString();
    return String(v);
  }
  // Round floats to 2 decimals, trim trailing zeros
  return Number(v.toFixed(2)).toString();
}

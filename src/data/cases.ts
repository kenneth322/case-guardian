import rawData from "./lovable_v8_merged_full_telco_vi.json";

// ---- Types ----
export type RiskLevel = "Low" | "Medium" | "High" | "Very High";
export type SummaryRisk = "Low Risk" | "Average Risk" | "High Risk" | "Very High Risk";
export type Influence = "positive" | "negative" | "neutral";

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

export interface Insight {
  title: string;
  text: string;
  influence: Influence;
  sourceVariable?: string;
}

export interface SectionResult {
  topN: number;
  risky: boolean;
  insights: Insight[];
  allInsights: Insight[];
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

// ---- Load cases ----
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

function normalizeSection(s: SectionResult): SectionResult {
  return {
    topN: s.topN ?? 0,
    risky: !!s.risky,
    insights: Array.isArray(s.insights) ? s.insights : [],
    allInsights: Array.isArray(s.allInsights) ? s.allInsights : [],
    // metadata intentionally retained but never surfaced in UI
    metadata: s.metadata,
  };
}

export const CASES_BY_MOBILE: Record<string, CaseRecord> = Object.fromEntries(
  Object.entries(rawCases).map(([mobile, c]) => [
    mobile,
    {
      ...c,
      results: {
        bureau: normalizeSection(c.results.bureau),
        telco: normalizeSection(c.results.telco),
        digital: normalizeSection(c.results.digital),
      },
    },
  ]),
);

export const DEMO_MOBILES: string[] = Object.keys(CASES_BY_MOBILE);

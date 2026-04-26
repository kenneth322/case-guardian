// Source of truth: "Risk Alerts Rules.xlsx"
// Maps bureau rule codes -> { category, description }.
// Order of entries below matches Excel row order. Categories appear in this
// natural order: CREDIT BUREAU DEFAULTS, ANOMALY, VELOCITY.

export interface BureauRuleMeta {
  code: string;
  description: string;
  category: string;
}

export const BUREAU_RULES: BureauRuleMeta[] = [
  { code: "STR_APPL_NE83", description: "APPLICANT IDENTIFIED AS A STRAIGHT ROLLER", category: "CREDIT BUREAU DEFAULTS" },
  { code: "BORR_APPL_NE82", description: "APPLICANT REPORTED AS A SUIT FILED - 36 MONTHS", category: "CREDIT BUREAU DEFAULTS" },
  { code: "BORR_APPL_NE81", description: "APPLICANT REPORTED AS A WILFUL DEFAULTER - 36 MONTHS", category: "CREDIT BUREAU DEFAULTS" },
  { code: "BORR_APPL_NE57", description: "APPLICANT WITH CONTINUOUS 3 MONTHS DEFAULT IN INITIAL 6 MONTHS", category: "CREDIT BUREAU DEFAULTS" },
  { code: "APPL_ADDR_VE70", description: "SAME APPLICANT WITH >2 RESIDENCE ADDRESS - 3 MONTHS", category: "ANOMALY" },
  { code: "APPL_MOB_VE71", description: "SAME APPLICANT WITH >3 MOBILE NUMBERS - 6 MONTHS", category: "ANOMALY" },
  { code: "APPL_ACT_VE43", description: "SAME APPLICANT WITH >3 OCCUPATION TYPES - 24 MONTHS", category: "ANOMALY" },
  { code: "APPL_ACT_VE44", description: "SAME APPLICANT WITH >4 LOAN PURPOSE - 2 MONTHS", category: "ANOMALY" },
  { code: "ID_APPL_MA32", description: "SAME APPLICANT WITH MULTIPLE PAN - 24 MONTHS", category: "ANOMALY" },
  { code: "ID_APPL_MA34", description: "SAME APPLICANT WITH MULTIPLE VOTER ID - 24 MONTHS", category: "ANOMALY" },
  { code: "ID_APPL_MA35", description: "SAME APPLICANT WITH SIMILAR PAN - 24 MONTHS", category: "ANOMALY" },
  { code: "ID_APPL_MA37", description: "SAME APPLICANT WITH SIMILAR VOTER ID - 24 MONTHS", category: "ANOMALY" },
  { code: "MOB_APP_MA77", description: "SAME MOBILE NUMBER ASSOCIATED WITH MULTIPLE APPLICANTS - 36 MONTHS", category: "ANOMALY" },
  { code: "ID_PAN_MA71", description: "SAME PAN ASSOCIATED WITH MULTIPLE APPLICANTS - 24 MONTHS", category: "ANOMALY" },
  { code: "PAN_PHN_MA75", description: "SAME PAN WITH >2 APPLICANTS AND PHONE NUMBER - 3 MONTHS", category: "ANOMALY" },
  { code: "MOB_PAN_MA76", description: "SAME PHONE NUMBER WITH >2 APPLICANTS AND PAN - 3 MONTHS", category: "ANOMALY" },
  { code: "ADDR_APPL_VE74", description: "SAME RESIDENCE ADDRESS WITH >2 APPLICANTS - 3 MONTHS", category: "ANOMALY" },
  { code: "ID_VID_MA73", description: "SAME VOTER ID ASSOCIATED WITH MULTIPLE APPLICANTS - 24 MONTHS", category: "ANOMALY" },
  { code: "APPL_ACT_VE45", description: "SAME ADDRESS IN >20 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "ADDR_ADDR_VE41", description: "SAME ADDRESS IN >4 APPLICATIONS - 1 MONTH", category: "VELOCITY" },
  { code: "ID_DL_VE55", description: "SAME DRIVING LICENSE IN >8 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "ID_EMAIL_VE46", description: "SAME EMAIL ADDRESS IN >12 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "ID_EMAIL_VE48", description: "SAME EMAIL ADDRESS IN >6 APPLICATIONS - 1 MONTH", category: "VELOCITY" },
  { code: "ID_GST_VE56", description: "SAME GST NUMBER IN >8 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "BORR_HH_VE51", description: "SAME HOUSEHOLD IN >50 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "ID_ID_VE42", description: "SAME KYC ID IN >8 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "ID_PAN_VE52", description: "SAME PAN IN >8 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "PHN_MOB_VE47", description: "SAME PHONE NUMBER IN >12 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
  { code: "PHN_MOB_VE49", description: "SAME PHONE NUMBER IN >6 APPLICATIONS - 1 MONTH", category: "VELOCITY" },
  { code: "ID_VID_VE54", description: "SAME VOTER ID IN >8 APPLICATIONS - 12 MONTHS", category: "VELOCITY" },
];

export const BUREAU_RULE_BY_CODE: Record<string, BureauRuleMeta> = Object.fromEntries(
  BUREAU_RULES.map((r) => [r.code, r]),
);

// Category order as they first appear in the Excel.
export const BUREAU_CATEGORY_ORDER: string[] = (() => {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const r of BUREAU_RULES) {
    if (!seen.has(r.category)) {
      seen.add(r.category);
      order.push(r.category);
    }
  }
  return order;
})();

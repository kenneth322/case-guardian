export type Severity = "Low" | "Medium" | "High";
export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export interface Applicant {
  mobile: string;
  email: string;
  aadhaar: string;
  pan: string;
  firstName: string;
  lastName: string;
  address: string;
  dob: string;
}

export interface CaseRecord {
  applicant: Applicant;
  overall: { risk: RiskLevel; score: number };
  bureau: { score: number; risk: RiskLevel; factors: { text: string; severity: Severity }[] };
  digital: { risky: boolean; factors: { text: string }[] };
  telco: { risky: boolean; factors: { text: string }[] };
}

export const CASES_BY_MOBILE: Record<string, CaseRecord> = {
  "7547934604": {
    applicant: {
      mobile: "7547934604",
      email: "ravi.sharma@example.com",
      aadhaar: "1234 5678 9012",
      pan: "ABCDE1234F",
      firstName: "Ravi",
      lastName: "Sharma",
      address: "Flat 12B, Green Acres, Baner, Pune, MH 411045",
      dob: "1992-08-14",
    },
    overall: { risk: "Low", score: 22 },
    bureau: {
      score: 28,
      risk: "Low",
      factors: [
        { text: "Stable credit history length > 4 years", severity: "Low" },
        { text: "No recent delinquency reported", severity: "Low" },
        { text: "Low enquiry velocity in last 90 days", severity: "Low" },
      ],
    },
    digital: {
      risky: false,
      factors: [
        { text: "Consistent device identifiers across sessions" },
        { text: "No suspicious email domain patterns" },
        { text: "Normal signup and form-fill behavior" },
      ],
    },
    telco: {
      risky: false,
      factors: [
        { text: "SIM age > 18 months" },
        { text: "Normal call/SMS activity distribution" },
        { text: "No frequent SIM swap signals" },
      ],
    },
  },
  "7627096571": {
    applicant: {
      mobile: "7627096571",
      email: "neha.patel@example.com",
      aadhaar: "2345 6789 0123",
      pan: "PQRSX6789L",
      firstName: "Neha",
      lastName: "Patel",
      address: "B-904, Skyline Towers, Viman Nagar, Pune, MH 411014",
      dob: "1996-02-03",
    },
    overall: { risk: "Medium", score: 47 },
    bureau: {
      score: 55,
      risk: "Medium",
      factors: [
        { text: "Higher enquiry count in last 30 days", severity: "Medium" },
        { text: "Thin file / limited tradelines", severity: "Medium" },
        { text: "Recent address change detected", severity: "Low" },
      ],
    },
    digital: {
      risky: true,
      factors: [
        { text: "Multiple browser fingerprints observed" },
        { text: "Rapid form completion time" },
        { text: "Inconsistent geolocation signals" },
      ],
    },
    telco: {
      risky: false,
      factors: [
        { text: "SIM age 9–12 months" },
        { text: "Normal recharge behavior" },
        { text: "No port-out indicators" },
      ],
    },
  },
  "7524536787": {
    applicant: {
      mobile: "7524536787",
      email: "imran.khan@example.com",
      aadhaar: "3456 7890 1234",
      pan: "LMNOP4321Q",
      firstName: "Imran",
      lastName: "Khan",
      address: "22, Lakeside Road, Kalyani Nagar, Pune, MH 411006",
      dob: "1989-11-27",
    },
    overall: { risk: "High", score: 71 },
    bureau: {
      score: 72,
      risk: "High",
      factors: [
        { text: "Recent delinquency reported in last 6 months", severity: "High" },
        { text: "High credit utilization on revolving lines", severity: "High" },
        { text: "Multiple enquiries across lenders (30 days)", severity: "Medium" },
      ],
    },
    digital: {
      risky: true,
      factors: [
        { text: "VPN / proxy usage detected" },
        { text: "Device time-zone mismatch" },
        { text: "Repeated attempts with edited inputs" },
      ],
    },
    telco: {
      risky: true,
      factors: [
        { text: "SIM swap signal in last 7 days" },
        { text: "Low tenure number (SIM age < 3 months)" },
        { text: "Unusual recharge spikes" },
      ],
    },
  },
  "7601709226": {
    applicant: {
      mobile: "7601709226",
      email: "sneha.iyer@example.com",
      aadhaar: "4567 8901 2345",
      pan: "TUVWX1111Z",
      firstName: "Sneha",
      lastName: "Iyer",
      address: "14, River View Society, Aundh, Pune, MH 411007",
      dob: "1994-05-19",
    },
    overall: { risk: "Very High", score: 89 },
    bureau: {
      score: 85,
      risk: "Very High",
      factors: [
        { text: "Severe delinquency / write-off indicator", severity: "High" },
        { text: "Very high enquiry velocity (7–14 days)", severity: "High" },
        { text: "Multiple adverse accounts reported", severity: "High" },
      ],
    },
    digital: {
      risky: true,
      factors: [
        { text: "Emulator-like device characteristics" },
        { text: "Suspicious clipboard paste pattern" },
        { text: "Multiple identities attempted from same device" },
      ],
    },
    telco: {
      risky: true,
      factors: [
        { text: "Recent port-in / number recycling suspected" },
        { text: "Low outgoing activity vs high incoming bursts" },
        { text: "Frequent location changes over short duration" },
      ],
    },
  },
  "7521141423": {
    applicant: {
      mobile: "7521141423",
      email: "arjun.mehta@example.com",
      aadhaar: "5678 9012 3456",
      pan: "GHJKL2222P",
      firstName: "Arjun",
      lastName: "Mehta",
      address: "301, Orchid Residency, Hinjewadi, Pune, MH 411057",
      dob: "1991-01-08",
    },
    overall: { risk: "Medium", score: 52 },
    bureau: {
      score: 49,
      risk: "Medium",
      factors: [
        { text: "Moderate enquiry count (90 days)", severity: "Medium" },
        { text: "Short credit history length", severity: "Medium" },
        { text: "One recent late payment (12 months)", severity: "Low" },
      ],
    },
    digital: {
      risky: false,
      factors: [
        { text: "Normal device reputation" },
        { text: "Consistent IP ASN patterns" },
        { text: "No bot-like interaction anomalies" },
      ],
    },
    telco: {
      risky: true,
      factors: [
        { text: "SIM age 3–6 months" },
        { text: "Recharge frequency irregular" },
        { text: "Possible multiple SIM association" },
      ],
    },
  },
};

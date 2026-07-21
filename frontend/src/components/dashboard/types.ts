export interface ThreatCase {
  id: string;
  name: string;
  type: "APK" | "PE" | "SYS";
  size: string;
  hash: string;
  riskScore: number;
  status: "ACTIVE_TRACE" | "QUARANTINED" | "CLEARED" | "ANALYZING";
  date: string;
  agency: string;
  mitreCount: number;
  yaraMatches: string[];
}

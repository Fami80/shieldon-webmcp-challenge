/**
 * WebMCP Challenge POC — synthetic demo data only.
 *
 * Nothing here reads from or writes to Prisma, Core V1, or any real
 * ShieldOn customer data. This module is intentionally self-contained so
 * the whole POC can be deleted without touching anything else.
 */

export type EvidenceStatus = "DIRECTLY_VERIFIED" | "OPERATOR_CONFIRMED" | "UNVERIFIED";
export type InvestigationStatus =
  | "IN_PROGRESS"
  | "AWAITING_HUMAN_REVIEW"
  | "GOVERNED_FINDING_APPROVED"
  | "CANDIDATE_REJECTED"
  | "CLOSED";

export interface Investigation {
  investigationId: string;
  company: string;
  businessQuestion: string;
  status: InvestigationStatus;
  scope: string[];
}

export interface EvidenceRecord {
  evidenceId: string;
  evidenceType: "METRIC" | "RECORD_STATUS" | "COMMUNICATION_LOG";
  source: string;
  capturedAt: string;
  status: EvidenceStatus;
  summary: string;
  value?: {
    label: string;
    previous?: string;
    current: string;
    change?: string;
  };
}

export interface MissingEvidenceRequirement {
  requirementId: string;
  description: string;
  status: "OPEN";
  reason: string;
}

export interface Contradiction {
  contradictionId: string;
  description: string;
  evidenceRefs: string[];
}

export interface CandidateFinding {
  candidateId: string;
  label: string;
  supportingEvidenceRefs: string[];
  contradictionRefs: string[];
  isGoverned: false;
  disclaimer: string;
}

export interface GovernedFinding {
  findingId: string;
  investigationId: string;
  candidateId: string;
  label: string;
  status: "GOVERNED";
  approvedBy: "Human reviewer";
  reviewedAt: string;
  supportingEvidenceRefs: string[];
  contradictionTreatment: {
    contradictionRefs: string[];
    status: "ACKNOWLEDGED_REQUIRES_FOLLOW_UP";
  };
  missingEvidenceStatus: "OPEN_ITEMS_REMAIN";
  revenueGapEligibility: "ELIGIBLE_FOR_ASSESSMENT";
}

export interface HumanReviewSnapshot {
  investigationStatus: InvestigationStatus;
  decision: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt: string | null;
  governedFindings: GovernedFinding[];
}

const INVESTIGATION_ID = "inv-acme-dental-consultation-decline";
const CANDIDATE_ID = "cand-lead-handling-degradation";

export const investigation: Investigation = {
  investigationId: INVESTIGATION_ID,
  company: "Acme Dental Group",
  businessQuestion: "Why did booked consultations decline despite an increase in qualified leads?",
  status: "AWAITING_HUMAN_REVIEW",
  scope: [
    "Marketing lead generation",
    "Sales response and follow-up",
    "CRM contact record status",
    "Lead-to-consultation conversion",
  ],
};

export const evidence: EvidenceRecord[] = [
  {
    evidenceId: "ev-mql-volume",
    evidenceType: "METRIC",
    source: "Marketing analytics platform (synthetic)",
    capturedAt: "2026-07-01T00:00:00Z",
    status: "DIRECTLY_VERIFIED",
    summary: "Marketing qualified leads increased month over month.",
    value: { label: "Marketing qualified leads", previous: "181", current: "243", change: "+34%" },
  },
  {
    evidenceId: "ev-response-time",
    evidenceType: "METRIC",
    source: "CRM response-time report (synthetic)",
    capturedAt: "2026-07-01T00:00:00Z",
    status: "DIRECTLY_VERIFIED",
    summary: "Average first-response time to a new lead increased substantially.",
    value: { label: "Average first-response time", previous: "4.2 hours", current: "18.7 hours" },
  },
  {
    evidenceId: "ev-second-followup",
    evidenceType: "METRIC",
    source: "CRM engagement report (synthetic)",
    capturedAt: "2026-07-01T00:00:00Z",
    status: "DIRECTLY_VERIFIED",
    summary: "Only a portion of leads received a documented second follow-up.",
    value: { label: "Leads receiving a second follow-up", current: "59%" },
  },
  {
    evidenceId: "ev-crm-contacted-status",
    evidenceType: "RECORD_STATUS",
    source: "CRM contact records (synthetic)",
    capturedAt: "2026-07-01T00:00:00Z",
    status: "OPERATOR_CONFIRMED",
    summary: "Several CRM records for the current month are marked CONTACTED.",
  },
  {
    evidenceId: "ev-communication-log-gap",
    evidenceType: "COMMUNICATION_LOG",
    source: "Communication log (synthetic)",
    capturedAt: "2026-07-01T00:00:00Z",
    status: "UNVERIFIED",
    summary: "Some records marked CONTACTED in the CRM have no matching email or call entry in the communication log.",
  },
  {
    evidenceId: "ev-conversion-rate",
    evidenceType: "METRIC",
    source: "Marketing analytics platform (synthetic)",
    capturedAt: "2026-07-01T00:00:00Z",
    status: "DIRECTLY_VERIFIED",
    summary: "Lead-to-consultation conversion rate declined month over month.",
    value: { label: "Lead-to-consultation conversion", previous: "17.8%", current: "11.9%" },
  },
];

export const missingEvidence: MissingEvidenceRequirement[] = [
  {
    requirementId: "req-per-rep-response-time",
    description: "Per-rep or per-channel breakdown of first-response time, to isolate whether the slowdown is team-wide or localized.",
    status: "OPEN",
    reason: "Current response-time evidence is an aggregate average only.",
  },
  {
    requirementId: "req-contact-confirmation",
    description: "Direct confirmation (recording, transcript, or sent-mail record) for CRM records marked CONTACTED that have no matching communication-log entry.",
    status: "OPEN",
    reason: "CRM status and communication-log evidence disagree for an unspecified subset of records.",
  },
  {
    requirementId: "req-staffing-context",
    description: "Sales team staffing or tooling-change context for the current month.",
    status: "OPEN",
    reason: "No operational explanation for the response-time increase has been supplied yet.",
  },
];

export const contradictions: Contradiction[] = [
  {
    contradictionId: "contra-contacted-vs-communication-log",
    description:
      "CRM contact status marks several current-month records as CONTACTED, but the communication log has no corresponding email or call entry for some of those same records.",
    evidenceRefs: ["ev-crm-contacted-status", "ev-communication-log-gap"],
  },
];

export const candidateFindings: CandidateFinding[] = [
  {
    candidateId: CANDIDATE_ID,
    label: "Lead-handling speed and follow-up coverage may be contributing to the conversion decline.",
    supportingEvidenceRefs: ["ev-mql-volume", "ev-response-time", "ev-second-followup", "ev-conversion-rate"],
    contradictionRefs: ["contra-contacted-vs-communication-log"],
    isGoverned: false,
    disclaimer:
      "CANDIDATE — this is not a governed ShieldOn finding. It requires human review before it can be promoted to a governed finding.",
  },
];

export const initialHumanReviewSnapshot: HumanReviewSnapshot = {
  investigationStatus: "AWAITING_HUMAN_REVIEW",
  decision: "PENDING",
  reviewedAt: null,
  governedFindings: [],
};

let humanReviewSnapshot: HumanReviewSnapshot = initialHumanReviewSnapshot;
const reviewListeners = new Set<() => void>();

function publishReviewSnapshot(next: HumanReviewSnapshot) {
  humanReviewSnapshot = next;
  reviewListeners.forEach((listener) => listener());
}

export function subscribeToHumanReview(listener: () => void): () => void {
  reviewListeners.add(listener);
  return () => reviewListeners.delete(listener);
}

export function getHumanReviewSnapshot(): HumanReviewSnapshot {
  return humanReviewSnapshot;
}

export function approveCandidateAsHuman(candidateId: string): GovernedFinding {
  const candidate = candidateFindings.find((item) => item.candidateId === candidateId);
  if (!candidate) throw new Error("Candidate finding not found");
  if (humanReviewSnapshot.decision !== "PENDING") throw new Error("Human review decision already recorded");

  const reviewedAt = new Date().toISOString();
  const governedFinding: GovernedFinding = {
    findingId: `finding-${candidate.candidateId}`,
    investigationId: INVESTIGATION_ID,
    candidateId: candidate.candidateId,
    label: candidate.label,
    status: "GOVERNED",
    approvedBy: "Human reviewer",
    reviewedAt,
    supportingEvidenceRefs: [...candidate.supportingEvidenceRefs],
    contradictionTreatment: {
      contradictionRefs: [...candidate.contradictionRefs],
      status: "ACKNOWLEDGED_REQUIRES_FOLLOW_UP",
    },
    missingEvidenceStatus: "OPEN_ITEMS_REMAIN",
    revenueGapEligibility: "ELIGIBLE_FOR_ASSESSMENT",
  };

  publishReviewSnapshot({
    investigationStatus: "GOVERNED_FINDING_APPROVED",
    decision: "APPROVED",
    reviewedAt,
    governedFindings: [governedFinding],
  });

  return governedFinding;
}

export function rejectCandidateAsHuman(candidateId: string): void {
  const candidate = candidateFindings.find((item) => item.candidateId === candidateId);
  if (!candidate) throw new Error("Candidate finding not found");
  if (humanReviewSnapshot.decision !== "PENDING") throw new Error("Human review decision already recorded");

  const reviewedAt = new Date().toISOString();
  publishReviewSnapshot({
    investigationStatus: "CANDIDATE_REJECTED",
    decision: "REJECTED",
    reviewedAt,
    governedFindings: [],
  });
}

export function getInvestigation(investigationId: string): Investigation | null {
  if (investigationId !== INVESTIGATION_ID) return null;
  return { ...investigation, status: humanReviewSnapshot.investigationStatus };
}

export function listEvidence(investigationId: string): EvidenceRecord[] | null {
  return investigationId === INVESTIGATION_ID ? evidence : null;
}

export function getMissingEvidence(investigationId: string): MissingEvidenceRequirement[] | null {
  return investigationId === INVESTIGATION_ID ? missingEvidence : null;
}

export function getContradictions(investigationId: string): Contradiction[] | null {
  return investigationId === INVESTIGATION_ID ? contradictions : null;
}

export function getCandidateFindings(investigationId: string): CandidateFinding[] | null {
  return investigationId === INVESTIGATION_ID ? candidateFindings : null;
}

export function getGovernedFindings(investigationId: string): GovernedFinding[] | null {
  return investigationId === INVESTIGATION_ID ? humanReviewSnapshot.governedFindings : null;
}

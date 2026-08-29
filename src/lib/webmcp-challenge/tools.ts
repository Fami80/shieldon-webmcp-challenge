"use client";

import {
  getInvestigation,
  listEvidence,
  getMissingEvidence,
  getContradictions,
  getCandidateFindings,
  getGovernedFindings,
} from "@/lib/webmcp-challenge/data";

interface WebMcpToolRegistration {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface WebMcpToolHandle {
  unregister?: () => void;
}

interface WebMcpModelContext {
  registerTool: (tool: WebMcpToolRegistration) => WebMcpToolHandle | void;
}

function getModelContext(): WebMcpModelContext | null {
  if (typeof document === "undefined") return null;
  const context = (document as unknown as { modelContext?: WebMcpModelContext }).modelContext;
  return context ?? null;
}

export function isWebMcpAvailable(): boolean {
  return getModelContext() !== null;
}

function requireInvestigationId(input: Record<string, unknown>): string {
  const investigationId = input?.investigationId;
  if (typeof investigationId !== "string" || investigationId.length === 0) {
    throw new Error("investigationId is required");
  }
  return investigationId;
}

const investigationIdSchema = {
  type: "object",
  properties: {
    investigationId: {
      type: "string",
      description: "The ShieldOn investigation ID returned by shieldon_get_investigation.",
    },
  },
  required: ["investigationId"],
  additionalProperties: false,
} as const;

const tools: WebMcpToolRegistration[] = [
  {
    name: "shieldon_get_investigation",
    description:
      "Read-only. Returns the ShieldOn investigation being examined: its ID, the business question under investigation, its current status, and its scope. Call this first to get the investigationId needed by the other shieldon_* tools. If a human reviewer later approves or rejects the candidate, this tool returns that updated governed status.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    execute: async () => {
      const result = getInvestigation("inv-acme-dental-consultation-decline");
      if (!result) throw new Error("Investigation not found");
      return result;
    },
  },
  {
    name: "shieldon_list_evidence",
    description:
      "Read-only. Returns the governed evidence records ShieldOn has collected for an investigation — each with its source, capture time, verification status, and a summary or measured value. Use this to see what is actually known, as distinct from what is missing or contradictory.",
    inputSchema: investigationIdSchema,
    execute: async (input) => {
      const result = listEvidence(requireInvestigationId(input));
      if (!result) throw new Error("Unknown investigationId");
      return result;
    },
  },
  {
    name: "shieldon_get_missing_evidence",
    description:
      "Read-only. Returns the evidence ShieldOn believes is still required to fully explain the investigation, and why it's needed. This is evidence that does not yet exist in the record — it is never itself treated as proof of anything.",
    inputSchema: investigationIdSchema,
    execute: async (input) => {
      const result = getMissingEvidence(requireInvestigationId(input));
      if (!result) throw new Error("Unknown investigationId");
      return result;
    },
  },
  {
    name: "shieldon_get_contradictions",
    description:
      "Read-only. Returns places where two or more evidence sources for this investigation disagree with each other, with references to the specific evidence records involved. Contradictions are signals to investigate further, not conclusions.",
    inputSchema: investigationIdSchema,
    execute: async (input) => {
      const result = getContradictions(requireInvestigationId(input));
      if (!result) throw new Error("Unknown investigationId");
      return result;
    },
  },
  {
    name: "shieldon_get_candidate_findings",
    description:
      "Read-only. Returns CANDIDATE findings only — unverified hypotheses ShieldOn's evidence pattern suggests, each linked to its supporting evidence and any related contradictions. Candidates are explicitly not governed findings: they cannot be treated as ShieldOn's conclusion and cannot be approved through this tool. A human must review and approve a finding inside ShieldOn before it becomes canonical.",
    inputSchema: investigationIdSchema,
    execute: async (input) => {
      const result = getCandidateFindings(requireInvestigationId(input));
      if (!result) throw new Error("Unknown investigationId");
      return result;
    },
  },
  {
    name: "shieldon_get_governed_findings",
    description:
      "Read-only. Returns only findings that have already been approved through ShieldOn's protected human-review UI. Before human approval this returns an empty list. This tool cannot approve, reject, edit, or promote any finding.",
    inputSchema: investigationIdSchema,
    execute: async (input) => {
      const result = getGovernedFindings(requireInvestigationId(input));
      if (!result) throw new Error("Unknown investigationId");
      return result;
    },
  },
];

const REGISTRATION_SENTINEL = "__shieldonWebMcpToolsRegistered";

export function registerShieldOnWebMcpTools(): () => void {
  const modelContext = getModelContext();
  if (!modelContext) return () => {};

  const doc = document as unknown as Record<string, boolean>;
  if (doc[REGISTRATION_SENTINEL]) return () => {};
  doc[REGISTRATION_SENTINEL] = true;

  const handles: WebMcpToolHandle[] = [];
  for (const tool of tools) {
    const handle = modelContext.registerTool(tool);
    if (handle) handles.push(handle);
  }

  return () => {
    for (const handle of handles) handle.unregister?.();
  };
}

export const webMcpToolDefinitions = tools;

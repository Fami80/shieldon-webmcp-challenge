"use client";

import {
  getInvestigation,
  listEvidence,
  getMissingEvidence,
  getContradictions,
  getCandidateFindings,
} from "@/lib/webmcp-challenge/data";

/**
 * Minimal shape of the experimental WebMCP browser API
 * (`document.modelContext`). Not in TypeScript's DOM lib yet, so this is
 * declared locally rather than touching any shared type definitions.
 */
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
      "Read-only. Returns the ShieldOn investigation being examined: its ID, the business question under investigation, its current status, and its scope. Call this first to get the investigationId needed by the other shieldon_* tools.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
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
      const investigationId = requireInvestigationId(input);
      const result = listEvidence(investigationId);
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
      const investigationId = requireInvestigationId(input);
      const result = getMissingEvidence(investigationId);
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
      const investigationId = requireInvestigationId(input);
      const result = getContradictions(investigationId);
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
      const investigationId = requireInvestigationId(input);
      const result = getCandidateFindings(investigationId);
      if (!result) throw new Error("Unknown investigationId");
      return result;
    },
  },
];

/**
 * A dev remount (React Strict Mode's mount/cleanup/mount cycle, or a Fast
 * Refresh) re-runs the effect that calls registerShieldOnWebMcpTools() on
 * the same document. The WebMCP runtime rejects a second registerTool()
 * call for a name it already has, so this sentinel makes registration a
 * one-time-per-document operation regardless of how many times the effect
 * fires. It deliberately never resets — unregister() support isn't
 * confirmed by the runtime, so re-registering after a cleanup could throw
 * the same duplicate error again.
 */
const REGISTRATION_SENTINEL = "__shieldonWebMcpToolsRegistered";

/**
 * Registers the read-only ShieldOn WebMCP demo tools with the browser's
 * WebMCP runtime, if one is present. Safe to call when no WebMCP runtime
 * exists (e.g. a plain human visit) — it's a no-op in that case. Safe to
 * call more than once on the same document — only the first call actually
 * registers anything.
 *
 * Returns a cleanup function that unregisters every tool this specific
 * call registered (a no-op if this call was skipped as a duplicate).
 */
export function registerShieldOnWebMcpTools(): () => void {
  const modelContext = getModelContext();
  if (!modelContext) {
    return () => {};
  }

  const doc = document as unknown as Record<string, boolean>;
  if (doc[REGISTRATION_SENTINEL]) {
    return () => {};
  }
  doc[REGISTRATION_SENTINEL] = true;

  const handles: WebMcpToolHandle[] = [];
  for (const tool of tools) {
    const handle = modelContext.registerTool(tool);
    if (handle) handles.push(handle);
  }

  return () => {
    for (const handle of handles) {
      handle.unregister?.();
    }
  };
}

export const webMcpToolDefinitions = tools;

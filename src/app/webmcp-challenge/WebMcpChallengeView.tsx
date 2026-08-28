"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  investigation,
  evidence,
  missingEvidence,
  contradictions,
  candidateFindings,
} from "@/lib/webmcp-challenge/data";
import { registerShieldOnWebMcpTools, isWebMcpAvailable, webMcpToolDefinitions } from "@/lib/webmcp-challenge/tools";

type WebMcpStatus = "checking" | "registered" | "unavailable";

const noopSubscribe = () => () => {};
const getServerWebMcpStatus = (): WebMcpStatus => "checking";
const getClientWebMcpStatus = (): WebMcpStatus => (isWebMcpAvailable() ? "registered" : "unavailable");

/**
 * document.modelContext's presence differs between server (never present)
 * and client (may already be present in a WebMCP-enabled browser by the
 * time this renders). useSyncExternalStore is React's sanctioned way to
 * read a value like that: it forces the server snapshot ("checking") for
 * both the SSR render and the client's first hydration pass — so hydration
 * always matches — then swaps to the real client snapshot right after,
 * without needing a manual setState-in-effect.
 */
function useWebMcpStatus(): WebMcpStatus {
  return useSyncExternalStore(noopSubscribe, getClientWebMcpStatus, getServerWebMcpStatus);
}

export function WebMcpChallengeView() {
  const webMcpStatus = useWebMcpStatus();

  useEffect(() => {
    const cleanup = registerShieldOnWebMcpTools();
    return cleanup;
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-gold-bright">SHIELDON</p>
        <p className="mt-1 text-sm uppercase tracking-[0.18em] text-muted">WebMCP investigation demo</p>

        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {investigation.businessQuestion}
        </h1>
        <p className="mt-3 text-sm text-muted">{investigation.company}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
            Agent access: <span className="text-mint">READ ONLY</span>
          </span>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
            Governance: <span className="text-gold-bright">human approval required for canonical findings</span>
          </span>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
            WebMCP tools:{" "}
            {webMcpStatus === "checking" ? (
              <span className="text-faint">checking…</span>
            ) : webMcpStatus === "registered" ? (
              <span className="text-mint">registered</span>
            ) : (
              <span className="text-faint">not available in this browser</span>
            )}
          </span>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Evidence available</h2>
          <p className="mt-1 text-sm text-muted">
            Scope: {investigation.scope.join(" · ")}
          </p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {evidence.map((item) => (
              <li key={item.evidenceId} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-sm font-medium">{item.summary}</span>
                  <span className="font-mono text-xs text-faint">{item.status}</span>
                </div>
                {item.value ? (
                  <p className="mt-1 font-mono text-sm text-mint">
                    {item.value.label}: {item.value.previous ? `${item.value.previous} → ` : ""}
                    {item.value.current}
                    {item.value.change ? ` (${item.value.change})` : ""}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-faint">Source: {item.source}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Missing evidence</h2>
          <p className="mt-1 text-sm text-muted">Evidence ShieldOn still needs before this investigation can be conclusive.</p>
          <ul className="mt-4 space-y-3">
            {missingEvidence.map((item) => (
              <li key={item.requirementId} className="rounded-lg border border-line p-4">
                <p className="text-sm font-medium">{item.description}</p>
                <p className="mt-1 text-xs text-faint">{item.reason}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Contradictions</h2>
          <p className="mt-1 text-sm text-muted">Places where two evidence sources disagree.</p>
          <ul className="mt-4 space-y-3">
            {contradictions.map((item) => (
              <li key={item.contradictionId} className="rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
                <p className="text-sm font-medium">{item.description}</p>
                <p className="mt-1 font-mono text-xs text-faint">refs: {item.evidenceRefs.join(", ")}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Candidate findings</h2>
          <p className="mt-1 text-sm text-muted">
            Unverified hypotheses only. Not governed ShieldOn findings — human review is required before any of these
            could become a canonical Revenue Gap finding.
          </p>
          <ul className="mt-4 space-y-3">
            {candidateFindings.map((item) => (
              <li key={item.candidateId} className="rounded-lg border border-line p-4">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-gold-bright">{item.disclaimer}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-lg border border-line bg-surface/60 p-5">
          <h2 className="text-sm font-semibold">For AI agents</h2>
          <p className="mt-1 text-sm text-muted">
            This page registers {webMcpToolDefinitions.length} read-only WebMCP tools via{" "}
            <code className="rounded bg-background px-1 py-0.5 text-xs">document.modelContext.registerTool</code>.
            None of them can approve a finding, mark evidence VERIFIED, or change any ShieldOn data — human governance
            for this investigation stays inside ShieldOn.
          </p>
          <ul className="mt-3 space-y-1 font-mono text-xs text-faint">
            {webMcpToolDefinitions.map((tool) => (
              <li key={tool.name}>{tool.name}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

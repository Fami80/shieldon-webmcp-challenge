import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-gold-bright">SHIELDON</p>
        <p className="mt-1 text-sm uppercase tracking-[0.18em] text-muted">WebMCP challenge submission</p>

        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          A governed revenue investigation, made readable by an agent.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          This standalone app exposes one synthetic ShieldOn investigation to a WebMCP-capable browser agent through
          five read-only tools registered with{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-xs">document.modelContext.registerTool</code>. The agent
          can read evidence, missing evidence, contradictions, and candidate findings. It cannot approve anything.
        </p>

        <Link
          href="/webmcp-challenge"
          className="mt-8 inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-gold/40"
        >
          Open the investigation demo &rarr;
        </Link>

        <p className="mt-10 text-xs text-faint">
          All data in this repository is synthetic. No real customer data, credentials, or private ShieldOn application
          code is included.
        </p>
      </div>
    </main>
  );
}

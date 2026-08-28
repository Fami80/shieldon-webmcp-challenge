import type { Metadata } from "next";
import { WebMcpChallengeView } from "@/app/webmcp-challenge/WebMcpChallengeView";

export const metadata: Metadata = {
  title: "ShieldOn WebMCP Investigation Demo",
  description:
    "A read-only WebMCP proof of concept: governed evidence, missing evidence, and contradictions from a ShieldOn revenue investigation, exposed to an agent via document.modelContext.registerTool.",
};

export default function WebMcpChallengePage() {
  return <WebMcpChallengeView />;
}

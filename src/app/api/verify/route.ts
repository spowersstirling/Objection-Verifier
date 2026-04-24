import Anthropic from "@anthropic-ai/sdk";
import type { Claim, ClaimAnalysis, VerificationResult } from "@/lib/types";

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Find the first { or [ and last } or ]
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");

  let start = -1;
  let endChar = "";

  if (firstBrace === -1 && firstBracket === -1) return text.trim();

  if (firstBrace === -1) {
    start = firstBracket;
    endChar = "]";
  } else if (firstBracket === -1) {
    start = firstBrace;
    endChar = "}";
  } else if (firstBracket < firstBrace) {
    start = firstBracket;
    endChar = "]";
  } else {
    start = firstBrace;
    endChar = "}";
  }

  const end = text.lastIndexOf(endChar);
  if (end === -1) return text.trim();

  return text.slice(start, end + 1).trim();
}

const client = new Anthropic();
const MODEL = "claude-opus-4-5";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, article, outlet, author, headline } = body as {
      transcript: string;
      article: string;
      outlet?: string;
      author?: string;
      headline?: string;
    };

    if (!transcript || !article) {
      return Response.json(
        { error: "transcript and article are required" },
        { status: 400 }
      );
    }

    // ── Step 1: Claim Extraction ──────────────────────────────────────────────
    console.log("Step 1 starting");
    const step1Response = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: `You are a forensic media analyst. Your job is to extract all substantive claims, direct quotes, factual assertions, and key arguments from an interview transcript.

Extract claims that would be newsworthy or verifiable if published in a media article. For each claim, note:

- The exact text of the claim (verbatim for direct quotes, summarised for positions)

- Whether it is a direct_quote, paraphrased_position, or factual_assertion

- A short unique ID (c1, c2, c3...)

Return ONLY a JSON array with no markdown, no preamble, no explanation. Format:

[{"id": "c1", "text": "...", "type": "direct_quote|paraphrased_position|factual_assertion"}]

Focus on: direct quotes that could appear verbatim in an article, factual claims with specific numbers or statistics, key arguments about the subject's position, origin stories or personal anecdotes that illuminate the subject, commercial or strategic claims.

Extract 12-18 claims. Prioritise substance over volume.`,
      messages: [
        {
          role: "user",
          content: `Extract all substantive claims from this interview transcript:\n\n${transcript}`,
        },
      ],
    });

    const step1Block = step1Response.content.find((b) => b.type === "text");
    if (!step1Block || step1Block.type !== "text") {
      return Response.json(
        { error: "Step 1 returned no text content" },
        { status: 500 }
      );
    }

    let claims: Claim[];
    try {
      console.log("Step 1 raw response:", step1Block.text);
      const parsed = JSON.parse(extractJSON(step1Block.text));
      claims = parsed.map(
        (c: {
          id: string;
          text: string;
          type: "direct_quote" | "paraphrased_position" | "factual_assertion";
        }) => ({ ...c, source: "transcript" as const })
      );
    } catch {
      return Response.json(
        { error: "Step 1 response was not valid JSON" },
        { status: 500 }
      );
    }
    console.log("Step 1 complete");

    // ── Step 2: Article Analysis ──────────────────────────────────────────────
    console.log("Step 2 starting");
    const step2Response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: `You are a forensic media analyst conducting an accuracy audit. You have been given a list of claims extracted from an interview and a published article based on that interview.

For each claim, analyse how the article handled it across these dimensions:

- presentInArticle: boolean — is this claim present in the article in any form?

- articleRendering: if present, what is the article's version of this claim (quote the article)?

- quoteFidelity: 0-100 — if it's a direct quote, how faithful is the article's rendering? 100 = verbatim, 0 = completely altered. If not a direct quote, score 100 if the position is fairly represented, lower if distorted or absent.

- contextRetention: 0-100 — does the article preserve the context and intent of this claim? Does surrounding editorial framing shift its meaning?

- editorialFraming: describe any editorial language around this claim that changes its emphasis or meaning. Null if none.

- finding: one sentence describing the accuracy finding for this claim.

Return ONLY a JSON array with no markdown, no preamble. Format:

[{"claimId": "c1", "claimText": "...", "presentInArticle": true, "articleRendering": "...", "quoteFidelity": 85, "contextRetention": 72, "editorialFraming": "...", "finding": "..."}]

Be specific and evidence-based. Quote directly from both sources. Do not editorialise.`,
      messages: [
        {
          role: "user",
          content: `CLAIMS FROM INTERVIEW:\n\n${JSON.stringify(claims, null, 2)}\n\nPUBLISHED ARTICLE:\n\n${article}\n\nAnalyse how accurately the article represented each claim.`,
        },
      ],
    });

    const step2Block = step2Response.content.find((b) => b.type === "text");
    if (!step2Block || step2Block.type !== "text") {
      return Response.json(
        { error: "Step 2 returned no text content" },
        { status: 500 }
      );
    }

    let claimAnalyses: ClaimAnalysis[];
    try {
      console.log("Step 2 raw response:", step2Block.text);
      claimAnalyses = JSON.parse(extractJSON(step2Block.text));
    } catch {
      return Response.json(
        { error: "Step 2 response was not valid JSON" },
        { status: 500 }
      );
    }
    console.log("Step 2 complete");

    // ── Step 3: Verdict Synthesis ─────────────────────────────────────────────
    console.log("Step 3 starting");
    const step3Response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: `You are a senior media accuracy analyst producing a final verdict. You have been given a per-claim accuracy analysis of a published article against its source interview.

Calculate these four dimensional scores (0-100) by averaging the relevant claim scores:

- quoteFidelity: average quoteFidelity across all claims where presentInArticle is true

- coverage: percentage of claims present in article × 100 (i.e. if 8 of 12 claims appear, coverage = 67)

- contextRetention: average contextRetention across all claims where presentInArticle is true

- materialOmission: 100 minus a penalty for omitted claims. Penalise heavily for omitted direct quotes or key factual assertions. Penalise lightly for omitted paraphrased positions.

Calculate aggregate score: (quoteFidelity × 0.30) + (coverage × 0.25) + (contextRetention × 0.25) + (materialOmission × 0.20)

Rating labels: 85-100 = Verified, 70-84 = Fair, 50-69 = Selective, 25-49 = Distorted, 0-24 = Fabricated

Write a three-sentence summary of findings. Each sentence should be specific and evidence-based.

Identify the top 3 most significant findings (omissions, distortions, or notably accurate elements).

Return ONLY a JSON object with no markdown, no preamble:

{
  "scores": {
    "quoteFidelity": number,
    "coverage": number,
    "contextRetention": number,
    "materialOmission": number,
    "aggregate": number
  },
  "ratingLabel": "Verified|Fair|Selective|Distorted|Fabricated",
  "summary": "Three sentences...",
  "topFindings": [
    {"type": "omission|distortion|accurate|framing", "description": "...", "evidence": "..."},
    {"type": "...", "description": "...", "evidence": "..."},
    {"type": "...", "description": "...", "evidence": "..."}
  ]
}`,
      messages: [
        {
          role: "user",
          content: `CLAIM-BY-CLAIM ANALYSIS:\n\n${JSON.stringify(claimAnalyses, null, 2)}\n\nProduce the final verdict.`,
        },
      ],
    });

    const step3Block = step3Response.content.find((b) => b.type === "text");
    if (!step3Block || step3Block.type !== "text") {
      return Response.json(
        { error: "Step 3 returned no text content" },
        { status: 500 }
      );
    }

    let verdict: {
      scores: VerificationResult["scores"];
      ratingLabel: VerificationResult["ratingLabel"];
      summary: string;
      topFindings: VerificationResult["topFindings"];
    };
    try {
      console.log("Step 3 raw response:", step3Block.text);
      verdict = JSON.parse(extractJSON(step3Block.text));
    } catch {
      return Response.json(
        { error: "Step 3 response was not valid JSON" },
        { status: 500 }
      );
    }
    console.log("Step 3 complete");

    // ── Assemble result ───────────────────────────────────────────────────────
    const result: VerificationResult = {
      outlet: outlet ?? "GearJunkie",
      author: author ?? "Will Brendza",
      articleHeadline: headline ?? "Article",
      verifiedAt: new Date().toISOString(),
      scores: verdict.scores,
      ratingLabel: verdict.ratingLabel,
      summary: verdict.summary,
      topFindings: verdict.topFindings,
      claimAnalyses,
    };

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("ROUTE ERROR:", error);
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: `Anthropic API error: ${error.message}` },
        { status: 500 }
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: `Verification failed: ${message}` },
      { status: 500 }
    );
  }
}

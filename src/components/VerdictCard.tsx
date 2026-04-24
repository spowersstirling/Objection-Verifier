"use client";

import { VerificationResult } from "@/lib/types";

interface VerdictCardProps {
  result: VerificationResult;
}

function dimensionScoreColor(score: number): string {
  if (score >= 75) return "var(--green-verified)";
  if (score >= 50) return "var(--amber-caution)";
  return "var(--red-verdict)";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

export default function VerdictCard({ result }: VerdictCardProps) {
  const dimensions: { label: string; key: keyof typeof result.scores }[] = [
    { label: "Quote Fidelity", key: "quoteFidelity" },
    { label: "Coverage", key: "coverage" },
    { label: "Context Retention", key: "contextRetention" },
    { label: "Material Omission", key: "materialOmission" },
  ];

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "var(--font-body)",
        border: "1px solid var(--rule)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          backgroundColor: "var(--ink)",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="font-mono"
          style={{
            color: "var(--paper)",
            fontSize: "12px",
            letterSpacing: "4px",
            fontWeight: 500,
          }}
        >
          OBJECTION
        </span>
        <span
          className="font-mono"
          style={{
            color: "var(--steel)",
            fontSize: "10px",
            letterSpacing: "1px",
          }}
        >
          {formatDate(result.verifiedAt)}
        </span>
      </div>

      {/* Card body */}
      <div
        style={{
          backgroundColor: "var(--paper)",
          color: "var(--ink)",
          padding: "36px 32px 28px",
        }}
      >
        {/* Outlet + author */}
        <div
          className="font-display"
          style={{
            fontSize: "14px",
            fontWeight: 400,
            color: "var(--steel)",
            marginBottom: "8px",
          }}
        >
          {result.outlet} · {result.author}
        </div>

        {/* Article headline */}
        <h1
          className="font-display"
          style={{
            fontSize: "20px",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--ink)",
            lineHeight: 1.3,
            marginBottom: "24px",
          }}
        >
          {result.articleHeadline}
        </h1>

        {/* Score block */}
        <div
          style={{
            borderBottom: "2px solid var(--ink)",
            paddingBottom: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
            <span
              className="font-display"
              style={{
                fontSize: "88px",
                fontWeight: 900,
                color: "var(--red-verdict)",
                letterSpacing: "-4px",
                lineHeight: 0.85,
                display: "block",
              }}
            >
              {result.scores.aggregate}
            </span>
            <div style={{ paddingBottom: "4px" }}>
              <div
                className="font-mono"
                style={{
                  fontSize: "16px",
                  color: "var(--slate)",
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                /100
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "var(--red-verdict)",
                  lineHeight: 1,
                }}
              >
                {result.ratingLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--slate)",
            lineHeight: 1.55,
            marginBottom: "24px",
          }}
        >
          {result.summary}
        </p>

        {/* Dimensional scores 2×2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: "1px solid var(--rule)",
            marginBottom: "20px",
          }}
        >
          {dimensions.map((dim, i) => {
            const score = result.scores[dim.key];
            const isRightCol = i % 2 === 1;
            const isBottomRow = i >= 2;
            return (
              <div
                key={dim.key}
                style={{
                  padding: "14px 16px",
                  borderLeft: isRightCol ? "1px solid var(--rule)" : undefined,
                  borderTop: isBottomRow ? "1px solid var(--rule)" : undefined,
                }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--slate)",
                    marginBottom: "6px",
                  }}
                >
                  {dim.label}
                </div>
                <div
                  className="font-display"
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: dimensionScoreColor(score),
                    lineHeight: 1,
                  }}
                >
                  {score}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--rule)",
            paddingTop: "12px",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "var(--steel)",
            }}
          >
            AI-VERIFIED ANALYSIS · OBJECTION MEDIA ACCURACY ENGINE · OBJECTION.AI
          </span>
        </div>
      </div>
    </div>
  );
}

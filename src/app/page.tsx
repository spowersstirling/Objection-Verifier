"use client";

import { useState, useRef } from "react";
import type { VerificationResult } from "@/lib/types";
import VerdictCard from "@/components/VerdictCard";
import demoResultRaw from "@/data/demo-result.json";

const demoResult = demoResultRaw as unknown as VerificationResult;

function findingBadgeStyle(type: string): React.CSSProperties {
  switch (type) {
    case "omission":
      return { background: "rgba(196,30,36,0.15)", color: "var(--red-verdict)" };
    case "distortion":
      return { background: "rgba(184,122,26,0.15)", color: "var(--amber-caution)" };
    case "accurate":
      return { background: "rgba(27,107,58,0.15)", color: "var(--green-verified)" };
    case "framing":
      return { background: "rgba(197,165,90,0.15)", color: "var(--gold-seal)" };
    default:
      return { background: "rgba(107,107,107,0.15)", color: "var(--steel)" };
  }
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "21px",
  fontWeight: 700,
  color: "var(--paper)",
  display: "block",
  marginBottom: "8px",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "#111",
  border: "1px solid #333",
  color: "var(--paper)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  padding: "16px",
  outline: "none",
};

export default function Home() {
  const demoRef = useRef<HTMLDivElement>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(true);

  // Verify form
  const [transcript, setTranscript] = useState("");
  const [article, setArticle]       = useState("");
  const [outlet, setOutlet]         = useState("");
  const [author, setAuthor]         = useState("");
  const [headline, setHeadline]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<VerificationResult | null>(null);
  const [error, setError]           = useState<string | null>(null);

  // Email capture
  const [email, setEmail]                   = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const scrollToDemo = () =>
    demoRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleVerify = async () => {
    if (!transcript.trim() || !article.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          article,
          outlet:   outlet   || undefined,
          author:   author   || undefined,
          headline: headline || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data as VerificationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!email.trim()) return;
    console.log("Email captured:", email);
    setEmailSubmitted(true);
  };

  const canSubmit = !loading && transcript.trim().length > 0 && article.trim().length > 0;

  return (
    <div style={{ background: "var(--ink)", minHeight: "100vh", color: "var(--paper)" }}>

      {/* ── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 40px",
            borderBottom: "1px solid #222",
          }}
        >
          <span className="font-mono" style={{ fontSize: "12px", letterSpacing: "4px" }}>
            OBJECTION
          </span>
          <span className="font-mono" style={{ fontSize: "10px", color: "#AAAAAA" }}>
            Media Accuracy Engine
          </span>
        </nav>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px",
          }}
        >
          <div>
            <p
              className="font-display"
              style={{
                fontSize: "27px",
                fontWeight: 700,
                color: "var(--gold-seal)",
                marginBottom: "24px",
              }}
            >
              AI-Powered Media Verification
            </p>
            <h1
              className="font-display"
              style={{
                fontSize: "72px",
                fontWeight: 900,
                letterSpacing: "-2px",
                color: "var(--paper)",
                lineHeight: 1.05,
                marginBottom: "24px",
              }}
            >
              Did the article tell
              <br />
              the whole story?
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "20px",
                fontStyle: "italic",
                color: "#AAAAAA",
                marginBottom: "48px",
              }}
            >
              Upload a transcript and an article. Get a verdict in seconds.
            </p>
            <button
              onClick={scrollToDemo}
              className="font-mono"
              style={{
                background: "var(--red-verdict)",
                color: "var(--paper)",
                border: "none",
                padding: "16px 48px",
                fontSize: "12px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              SEE THE DEMO ↓
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 40px", borderTop: "1px solid #222" }}>
        <p
          className="font-display"
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--gold-seal)",
            marginBottom: "16px",
          }}
        >
          The Process
        </p>
        <h2
          className="font-display"
          style={{ fontSize: "44px", fontWeight: 700, color: "var(--paper)", marginBottom: "60px" }}
        >
          From interview to verdict in three steps.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            {
              num: "01", letter: "T", label: "TRANSCRIPT",
              desc: "Paste a transcript or upload audio. The engine extracts every substantive claim, quote, and factual assertion the subject made.",
            },
            {
              num: "02", letter: "A", label: "ANALYSIS",
              desc: "Each claim is cross-referenced against the published article. Quote fidelity, coverage, context, and material omissions are scored independently.",
            },
            {
              num: "03", letter: "V", label: "VERDICT",
              desc: "A weighted aggregate score produces a public verdict. The evidence record is transparent, citable, and shareable.",
            },
          ].map((step, i) => (
            <div
              key={step.num}
              style={{ padding: "40px", borderLeft: i > 0 ? "1px solid #222" : undefined }}
            >
              <div
                className="font-display"
                style={{ fontSize: "48px", fontWeight: 900, color: "#999999", lineHeight: 1, marginBottom: "16px" }}
              >
                {step.letter}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "var(--gold-seal)",
                  marginBottom: "12px",
                }}
              >
                {step.num} / {step.label}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "#AAAAAA",
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: DEMO ─────────────────────────────────────────────────── */}
      <section id="demo" ref={demoRef} style={{ padding: "80px 40px", borderTop: "1px solid #222" }}>
        <p
          className="font-display"
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--gold-seal)",
            marginBottom: "16px",
          }}
        >
          Live Demonstration
        </p>
        <h2
          className="font-display"
          style={{ fontSize: "52px", fontWeight: 700, color: "var(--paper)", marginBottom: "8px" }}
        >
          GearJunkie vs. Aron D&apos;Souza
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            fontStyle: "italic",
            color: "#AAAAAA",
            marginBottom: "48px",
          }}
        >
          Interview conducted November 2024. Article published November 13, 2024.
        </p>

        {/* VerdictCard + Top Findings */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "45% 55%",
            gap: "40px",
            alignItems: "stretch",
            marginBottom: "40px",
          }}
        >
          <VerdictCard result={demoResult} />

          <div style={{ background: "#111", border: "1px solid #222", padding: "32px" }}>
            <p
              className="font-mono"
              style={{
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--gold-seal)",
                marginBottom: "24px",
              }}
            >
              TOP FINDINGS
            </p>
            <div>
              {demoResult.topFindings.map((finding, i) => (
                <div
                  key={i}
                  style={{
                    borderTop: i > 0 ? "1px solid #333" : undefined,
                    padding: "20px 0",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      padding: "4px 8px",
                      display: "inline-block",
                      ...findingBadgeStyle(finding.type),
                    }}
                  >
                    {finding.type}
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "18px",
                      color: "var(--paper)",
                      lineHeight: 1.5,
                      marginTop: "8px",
                    }}
                  >
                    {finding.description}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      color: "var(--paper)",
                      fontStyle: "italic",
                      lineHeight: 1.5,
                      marginTop: "6px",
                    }}
                  >
                    {finding.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evidence Record table */}
        <div style={{ border: "1px solid #222" }}>
          <button
            onClick={() => setEvidenceOpen((o) => !o)}
            className="font-mono"
            style={{
              width: "100%",
              background: "#111",
              border: "none",
              padding: "16px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              color: "var(--paper)",
            }}
          >
            <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold-seal)" }}>
              EVIDENCE RECORD — {demoResult.claimAnalyses.length} CLAIMS ANALYSED
            </span>
            <span style={{ fontSize: "16px", color: "#AAAAAA" }}>{evidenceOpen ? "↑" : "↓"}</span>
          </button>

          {evidenceOpen && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #222" }}>
                    {["Claim", "In Article", "Quote Fidelity", "Finding"].map((h) => (
                      <th
                        key={h}
                        className="font-mono"
                        style={{
                          padding: "12px 16px",
                          fontSize: "9px",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: "#AAAAAA",
                          textAlign: "left",
                          background: "#0D0D0D",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demoResult.claimAnalyses.map((ca, i) => (
                    <tr
                      key={ca.claimId}
                      style={{
                        borderBottom: "1px solid #1A1A1A",
                        background: i % 2 === 0 ? "#0D0D0D" : "#111",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          color: "var(--paper)",
                          lineHeight: 1.4,
                          maxWidth: "360px",
                        }}
                      >
                        {ca.claimText.length > 120
                          ? ca.claimText.slice(0, 120) + "…"
                          : ca.claimText}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "10px",
                            letterSpacing: "1px",
                            color: ca.presentInArticle
                              ? "var(--green-verified)"
                              : "var(--red-verdict)",
                          }}
                        >
                          {ca.presentInArticle ? "PRESENT" : "ABSENT"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span
                          className="font-display"
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color:
                              ca.quoteFidelity >= 75
                                ? "var(--green-verified)"
                                : ca.quoteFidelity >= 50
                                ? "var(--amber-caution)"
                                : "var(--red-verdict)",
                          }}
                        >
                          {ca.quoteFidelity}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          color: "var(--paper)",
                          fontStyle: "italic",
                          lineHeight: 1.4,
                        }}
                      >
                        {ca.finding}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4: VERIFY YOUR OWN ──────────────────────────────────────── */}
      <section
        style={{ padding: "80px 40px", background: "#0D0D0D", borderTop: "1px solid #222" }}
      >
        <p
          className="font-display"
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--gold-seal)",
            marginBottom: "16px",
          }}
        >
          Verify an Article
        </p>
        <h2
          className="font-display"
          style={{ fontSize: "44px", fontWeight: 700, color: "var(--paper)", marginBottom: "12px" }}
        >
          Submit an article for verification.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            color: "#AAAAAA",
            marginBottom: "48px",
          }}
        >
          Paste a transcript and the article text below. The engine will analyse it and return a
          verdict. Verification takes 30–60 seconds.
        </p>

        {/* Main textareas */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}
        >
          <div>
            <label style={labelStyle}>Interview Transcript</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the full transcript here..."
              style={{ ...fieldStyle, minHeight: "200px", resize: "vertical" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Published Article</label>
            <textarea
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              placeholder="Paste the full article text here..."
              style={{ ...fieldStyle, minHeight: "200px", resize: "vertical" }}
            />
          </div>
        </div>

        {/* Optional fields */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {(
            [
              { label: "Outlet Name",       value: outlet,   setter: setOutlet,   placeholder: "e.g. GearJunkie"  },
              { label: "Author Name",        value: author,   setter: setAuthor,   placeholder: "e.g. Will Brendza" },
              { label: "Article Headline",   value: headline, setter: setHeadline, placeholder: "Paste headline…"  },
            ] as const
          ).map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                style={fieldStyle}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleVerify}
          disabled={!canSubmit}
          className="font-mono"
          style={{
            background: canSubmit ? "var(--red-verdict)" : "#2A2A2A",
            color: canSubmit ? "var(--paper)" : "#555",
            border: "none",
            padding: "16px 48px",
            fontSize: "12px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            cursor: canSubmit ? "pointer" : "not-allowed",
            marginBottom: "48px",
          }}
        >
          {loading ? "ANALYSING… |" : "VERIFY →"}
        </button>

        {/* Error */}
        {error && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              fontStyle: "italic",
              color: "var(--red-verdict)",
              marginBottom: "32px",
            }}
          >
            {error}
          </p>
        )}

        {/* Live result */}
        {result && (
          <div style={{ marginBottom: "64px" }}>
            <VerdictCard result={result} />
          </div>
        )}

        {/* Email capture */}
        <div style={{ borderTop: "1px solid #222", paddingTop: "48px", maxWidth: "520px" }}>
          <label style={{ ...labelStyle, marginBottom: "16px" }}>
            Get notified when high-profile verifications are published
          </label>
          {emailSubmitted ? (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontStyle: "italic",
                color: "var(--gold-seal)",
              }}
            >
              You&apos;re on the list.
            </p>
          ) : (
            <div style={{ display: "flex" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                placeholder="your@email.com"
                style={{ ...fieldStyle, flex: 1 }}
              />
              <button
                onClick={handleEmailSubmit}
                className="font-mono"
                style={{
                  background: "var(--gold-seal)",
                  color: "var(--ink)",
                  border: "none",
                  padding: "16px 24px",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                NOTIFY ME
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 5: FOOTER ───────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #222",
          padding: "40px 80px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            className="font-mono"
            style={{ fontSize: "14px", letterSpacing: "4px", color: "var(--paper)", marginBottom: "4px" }}
          >
            OBJECTION
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontStyle: "italic",
              color: "#AAAAAA",
            }}
          >
            Media Accuracy Engine
          </div>
        </div>
        <div className="font-mono" style={{ fontSize: "10px", color: "#999999", textAlign: "right" }}>
          AI-verified analysis · Built as a prototype for Objection AI · April 2026
        </div>
      </footer>
    </div>
  );
}

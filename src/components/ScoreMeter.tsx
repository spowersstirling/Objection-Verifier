"use client";

import { useEffect, useState } from "react";

interface ScoreMeterProps {
  score: number;
  duration?: number;
}

export default function ScoreMeter({ score, duration = 1200 }: ScoreMeterProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, duration]);

  const trackStyle: React.CSSProperties = {
    width: "100%",
    height: "3px",
    backgroundColor: "var(--rule)",
    position: "relative",
    marginTop: "8px",
  };

  const fillStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${(displayed / 100) * 100}%`,
    backgroundColor:
      displayed >= 75
        ? "var(--green-verified)"
        : displayed >= 50
        ? "var(--amber-caution)"
        : "var(--red-verdict)",
    transition: "width 16ms linear",
  };

  return (
    <div>
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
}

import React, { useMemo } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Minimal SVG waterfall chart.
 * - deltas: array of numbers (positive/negative contributions)
 */
export default function WaterfallChart({
  deltas,
  width = 320,
  height = 120,
  gap = 2,
  positiveColor = "#4f46e5",
  negativeColor = "#ef4444",
  baselineColor = "#cbd5e1"
}) {
  const series = Array.isArray(deltas) ? deltas.map((d) => (Number.isFinite(Number(d)) ? Number(d) : 0)) : [];

  const { bars, minVal, maxVal } = useMemo(() => {
    let cumulative = 0;
    const nextBars = series.map((delta) => {
      const start = cumulative;
      const end = cumulative + delta;
      cumulative = end;
      return { start, end, delta };
    });

    const values = nextBars.flatMap((b) => [b.start, b.end]);
    values.push(0);

    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 1;

    // Prevent division by zero
    const safeMax = min === max ? max + 1 : max;

    return { bars: nextBars, minVal: min, maxVal: safeMax };
  }, [series]);

  const paddingX = 6;
  const paddingY = 10;
  const innerW = Math.max(1, width - paddingX * 2);
  const innerH = Math.max(1, height - paddingY * 2);

  const barCount = bars.length || 1;
  const barW = clamp(Math.floor((innerW - gap * (barCount - 1)) / barCount), 1, innerW);

  const yFor = (value) => {
    const t = (value - minVal) / (maxVal - minVal);
    return paddingY + (1 - t) * innerH;
  };

  const yZero = yFor(0);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Waterfall chart">
      {/* baseline */}
      <line x1={0} y1={yZero} x2={width} y2={yZero} stroke={baselineColor} strokeWidth={1} />

      {bars.map((b, idx) => {
        const x = paddingX + idx * (barW + gap);
        const y1 = yFor(b.start);
        const y2 = yFor(b.end);
        const top = Math.min(y1, y2);
        const h = Math.max(1, Math.abs(y2 - y1));
        const fill = b.delta >= 0 ? positiveColor : negativeColor;

        return (
          <g key={idx}>
            <rect x={x} y={top} width={barW} height={h} rx={2} fill={fill} opacity={0.9} />
            {/* connector */}
            {idx < bars.length - 1 && (
              <line
                x1={x + barW}
                y1={y2}
                x2={x + barW + gap}
                y2={y2}
                stroke="#94a3b8"
                strokeWidth={1}
                opacity={0.8}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

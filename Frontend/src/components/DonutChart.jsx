import React, { useMemo } from "react";

function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

export default function DonutChart({
  segments = [],
  size = 320,
  thickness,
  centerLabel,
  centerSubLabel,
  backgroundColor = "#e2e8f0"
}) {
  const resolvedThickness = useMemo(() => {
    if (thickness !== undefined && thickness !== null) return clamp(thickness, 10, Math.max(10, size / 2));
    // Default: thinner ring; clamp to keep it reasonable.
    return clamp(Math.round(size * 0.08), 12, 22);
  }, [size, thickness]);

  const safeSegments = useMemo(() => {
    const cleaned = (segments || [])
      .map((s) => ({
        label: s?.label ?? "",
        value: clamp(s?.value ?? 0, 0, Number.POSITIVE_INFINITY),
        color: s?.color ?? "#4f46e5"
      }))
      .filter((s) => s.value > 0);

    const total = cleaned.reduce((acc, s) => acc + s.value, 0);
    return { cleaned, total };
  }, [segments]);

  const radius = (size - resolvedThickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div
      style={{
        display: "flex",
        gap: "18px",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%"
      }}
    >
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={backgroundColor}
            strokeWidth={resolvedThickness}
          />

          {(safeSegments.cleaned.length ? safeSegments.cleaned : [{ label: "", value: 1, color: "#cbd5e1" }]).map(
            (seg, index) => {
              const total = safeSegments.total || 1;
              const frac = seg.value / total;
              const dash = circumference * frac;
              const dashArray = `${dash} ${circumference - dash}`;
              const dashOffset = -offset;
              offset += dash;

              return (
                <circle
                  key={`${seg.label}-${index}`}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={resolvedThickness}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
            }
          )}
        </svg>

        {(centerLabel || centerSubLabel) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              pointerEvents: "none"
            }}
          >
            {centerLabel && (
              <div
                style={{
                  fontWeight: 800,
                  fontSize: `${clamp(Math.round(size * 0.16), 18, 36)}px`,
                  color: "#0f172a",
                  lineHeight: 1.1
                }}
              >
                {centerLabel}
              </div>
            )}
            {centerSubLabel && (
              <div
                style={{
                  fontSize: `${clamp(Math.round(size * 0.075), 11, 14)}px`,
                  color: "#64748b",
                  marginTop: "4px"
                }}
              >
                {centerSubLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {safeSegments.cleaned.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {safeSegments.cleaned.map((seg) => {
            const pct = safeSegments.total ? Math.round((seg.value / safeSegments.total) * 1000) / 10 : 0;
            return (
              <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: seg.color, display: "inline-block" }} />
                <div style={{ fontSize: "13px", color: "#1e293b" }}>
                  {seg.label} <span style={{ color: "#64748b" }}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SparklineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}

/** A tiny in-cell-style trend line, computed live from real numbers. */
export function Sparkline({ values, color = "#2E9E5B", width = 120, height = 32 }: SparklineProps) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const lastX = (values.length - 1) * step;
  const lastY = height - ((values[values.length - 1]! - min) / range) * height;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend sparkline">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={3} fill={color} />
    </svg>
  );
}

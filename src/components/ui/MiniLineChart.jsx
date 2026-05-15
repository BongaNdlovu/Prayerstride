export default function MiniLineChart({ data, width = 280, height = 140, lineColor = '#082A4A', dotColor = '#C8892B' }) {
  if (!data || data.length === 0) return null;

  const padding = { top: 10, right: 10, bottom: 24, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.prayers ?? d.value ?? 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  const getX = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const getY = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

  let pathD = '';
  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.prayers ?? d.value ?? 0);
    pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  const yTicks = [minVal, (minVal + maxVal) / 2, maxVal];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-label="Prayer activity line graph">
      {/* Grid lines */}
      {yTicks.map((t, i) => {
        const y = getY(t);
        return (
          <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E7DFD2" strokeWidth={1} />
        );
      })}

      {/* Y labels */}
      {yTicks.map((t, i) => {
        const y = getY(t);
        return (
          <text key={`yl-${i}`} x={padding.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
            {Math.round(t)}
          </text>
        );
      })}

      {/* X labels */}
      {data.map((d, i) => {
        const x = getX(i);
        return (
          <text key={`xl-${i}`} x={x} y={height - 4} textAnchor="middle" fontSize={10} fill="#9ca3af">
            {d.day}
          </text>
        );
      })}

      {/* Line */}
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d, i) => {
        const x = getX(i);
        const y = getY(d.prayers ?? d.value ?? 0);
        const isLast = i === data.length - 1;
        return (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r={isLast ? 4 : 2.5}
            fill={isLast ? dotColor : lineColor}
            stroke="white"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

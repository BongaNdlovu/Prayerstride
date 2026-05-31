import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { alpha, colors, spacing } from '../theme';

export default function WeeklyBarChart({ data, width = 308, height = 150 }) {
  if (!data || data.length === 0) return null;

  const padding = { top: 12, right: 10, bottom: 26, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const values = data.map((item) => item.prayers ?? item.value ?? item.minutes ?? 0);
  const maxVal = Math.max(...values, 1);
  const barWidth = chartW / data.length - 8;

  return (
    <View style={{ marginTop: spacing.md + 2, width: '100%', overflow: 'hidden' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.goldLight} />
            <Stop offset="1" stopColor={colors.goldDark} />
          </LinearGradient>
        </Defs>
        {[0, 0.25, 0.5, 0.75, 1].map((frac, index) => {
          const y = padding.top + chartH * (1 - frac);
          const label = Math.round(maxVal * frac);
          return (
            <SvgText key={`yl-${index}`} x={padding.left - 7} y={y + 4} textAnchor="end" fontSize="10" fill={alpha.ivory55}>
              {frac === 0 ? '0m' : `${label}m`}
            </SvgText>
          );
        })}
        {data.map((item, index) => {
          const value = item.prayers ?? item.value ?? item.minutes ?? 0;
          const barH = (value / maxVal) * chartH;
          const x = padding.left + index * (chartW / data.length) + 4;
          const y = padding.top + chartH - barH;
          return (
            <Rect
              key={`bar-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, 2)}
              rx={4}
              fill="url(#barGrad)"
            />
          );
        })}
        {data.map((item, index) => {
          const x = padding.left + index * (chartW / data.length) + barWidth / 2 + 4;
          return (
            <SvgText key={`xl-${index}`} x={x} y={height - 5} textAnchor="middle" fontSize="10" fill={alpha.ivory58}>
              {item.day}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { colors, spacing } from '../theme';

function buildAxisTicks(maxValue) {
  const value = Math.max(1, Math.ceil(Number(maxValue) || 0));
  if (value <= 4) {
    return Array.from({ length: value + 1 }, (_, index) => index);
  }

  const roughStep = value / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceStep = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceStep * magnitude;
  const axisMax = Math.ceil(value / step) * step;
  const ticks = [];

  for (let tick = 0; tick <= axisMax; tick += step) {
    ticks.push(tick);
  }

  return ticks;
}

export default function WeeklyBarChart({ data, width = 308, height = 150, unit = 'sessions' }) {
  if (!data || data.length === 0) return null;

  const padding = { top: 12, right: 12, bottom: 26, left: 34 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const values = data.map((item) => item.prayers ?? item.value ?? item.minutes ?? 0);
  const maxVal = Math.max(...values, 1);
  const yTicks = buildAxisTicks(maxVal);
  const axisMax = yTicks[yTicks.length - 1] || 1;
  const barWidth = chartW / data.length - 8;

  return (
    <View style={{ marginTop: spacing.md + 2, width: '100%', overflow: 'hidden' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.tealLight} />
            <Stop offset="1" stopColor={colors.teal} />
          </LinearGradient>
        </Defs>
        {yTicks.map((tick, index) => {
          const y = padding.top + chartH * (1 - tick / axisMax);
          const suffix = unit === 'minutes' ? 'm' : '';
          return (
            <Fragment key={`yl-${index}`}>
              <Line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke={colors.surface3}
                strokeWidth={1}
              />
              <SvgText x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill={colors.ink3}>
                {`${tick}${suffix}`}
              </SvgText>
            </Fragment>
          );
        })}
        {data.map((item, index) => {
          const value = item.prayers ?? item.value ?? item.minutes ?? 0;
          const barH = (value / axisMax) * chartH;
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
            <SvgText key={`xl-${index}`} x={x} y={height - 5} textAnchor="middle" fontSize="10" fill={colors.ink4}>
              {item.day}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

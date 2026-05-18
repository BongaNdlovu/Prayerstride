import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

export default function MiniLineChart({ data, width = 308, height = 150 }) {
  if (!data || data.length === 0) return null;

  const padding = { top: 12, right: 10, bottom: 26, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const values = data.map((item) => item.prayers ?? item.value ?? 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;
  const getX = (index) => padding.left + (index / Math.max(data.length - 1, 1)) * chartW;
  const getY = (value) => padding.top + chartH - ((value - minVal) / range) * chartH;
  const yTicks = [minVal, (minVal + maxVal) / 2, maxVal];
  const pathD = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item.prayers ?? item.value ?? 0);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <View style={{ marginTop: 14, width: '100%', overflow: 'hidden' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {yTicks.map((tick, index) => {
          const y = getY(tick);
          return (
            <Line key={`grid-${index}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(248,243,234,0.14)" strokeWidth="1" />
          );
        })}
        {yTicks.map((tick, index) => {
          const y = getY(tick);
          return (
            <SvgText key={`yl-${index}`} x={padding.left - 7} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(248,243,234,0.5)">
              {Math.round(tick)}
            </SvgText>
          );
        })}
        {data.map((item, index) => {
          const x = getX(index);
          return (
            <SvgText key={`xl-${index}`} x={x} y={height - 5} textAnchor="middle" fontSize="10" fill="rgba(248,243,234,0.56)">
              {item.day}
            </SvgText>
          );
        })}
        <Path d={pathD} fill="none" stroke={colors.gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const value = item.prayers ?? item.value ?? 0;
          const isLast = index === data.length - 1;
          return (
            <Circle
              key={`dot-${index}`}
              cx={getX(index)}
              cy={getY(value)}
              r={isLast ? 4.5 : 3}
              fill={isLast ? colors.ivory : colors.gold}
              stroke="#080b13"
              strokeWidth="1.5"
            />
          );
        })}
      </Svg>
    </View>
  );
}

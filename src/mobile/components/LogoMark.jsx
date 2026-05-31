import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors } from '../theme';

export default function LogoMark({ size = 48, color = colors.gold }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const crossH = s * 0.38;
  const crossW = s * 0.08;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Olive branch curve */}
      <Path
        d={`M ${s * 0.15} ${s * 0.72} Q ${s * 0.35} ${s * 0.55} ${cx} ${s * 0.48} Q ${s * 0.65} ${s * 0.42} ${s * 0.85} ${s * 0.28}`}
        stroke={color}
        strokeWidth={s * 0.04}
        fill="none"
        strokeLinecap="round"
      />
      {/* Small leaves */}
      <Path d={`M ${s * 0.28} ${s * 0.62} Q ${s * 0.32} ${s * 0.55} ${s * 0.38} ${s * 0.58}`} stroke={color} strokeWidth={s * 0.025} fill="none" />
      <Path d={`M ${s * 0.55} ${s * 0.5} Q ${s * 0.6} ${s * 0.44} ${s * 0.66} ${s * 0.47}`} stroke={color} strokeWidth={s * 0.025} fill="none" />
      <Path d={`M ${s * 0.72} ${s * 0.38} Q ${s * 0.77} ${s * 0.32} ${s * 0.82} ${s * 0.35}`} stroke={color} strokeWidth={s * 0.025} fill="none" />
      {/* Cross vertical */}
      <Line x1={cx} y1={cy - crossH / 2} x2={cx} y2={cy + crossH / 2} stroke={color} strokeWidth={crossW} strokeLinecap="round" />
      {/* Cross horizontal */}
      <Line x1={cx - crossH * 0.28} y1={cy - crossH * 0.12} x2={cx + crossH * 0.28} y2={cy - crossH * 0.12} stroke={color} strokeWidth={crossW} strokeLinecap="round" />
      {/* Center dot */}
      <Circle cx={cx} cy={cy - crossH * 0.12} r={crossW * 0.6} fill={color} />
    </Svg>
  );
}

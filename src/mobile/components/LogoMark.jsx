import { Image } from 'react-native';

const transparentLogo = require('../../../assets/logo-transparent.png');

export default function LogoMark({ size = 48 }) {
  return (
    <Image
      source={transparentLogo}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

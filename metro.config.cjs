const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isNative = platform === 'ios' || platform === 'android';

  if (isNative && (moduleName === '@firebase/auth' || moduleName === 'firebase/auth')) {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'node_modules', '@firebase', 'auth', 'dist', 'rn', 'index.js'),
    };
  }

  if (defaultResolveRequest) return defaultResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });

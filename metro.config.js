const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');          // <-- tell Metro about .cjs files
config.resolver.unstable_enablePackageExports = false; // <-- bypass exports field

module.exports = withNativeWind(config, { input: './global.css' });

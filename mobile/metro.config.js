const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for React Native module resolution issues
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Fix module resolution to prevent pnpm symlink issues
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Exclude problematic directories from watching
config.resolver.blockList = [
  /node_modules\/.*lightningcss.*\/$/,
  /node_modules\/.*-linux-.*\/$/,
  /node_modules\/.*-darwin-.*\/$/,
  /node_modules\/.*-win32-.*\/$/,
];

// Add additional asset extensions
config.resolver.assetExts.push('bin');

// Ensure we're using the correct project root
config.projectRoot = __dirname;

// Reset the watch folders to only include our project directory
config.watchFolders = [__dirname];

// Clear transformer cache
config.transformer.minifierPath = require.resolve('metro-minify-terser');

module.exports = config;

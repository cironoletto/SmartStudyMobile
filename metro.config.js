const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [];
config.resolver = {
  ...config.resolver,
  unstable_watchman: false,
};

module.exports = config;

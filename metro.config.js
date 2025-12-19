const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// 🔒 MEVCUT ALIAS'LAR — HİÇ DOKUNULMADI
config.resolver.alias = {
  "@src": path.resolve(__dirname, "src"),
  "@app": path.resolve(__dirname, "app"),
  "@": path.resolve(__dirname),
};

// 🔥 ROOT /location klasörünü Metro’ya izlet
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, "location"),
];

// 🔥 ROOT /location importlarını resolve et (ASİL KRİTİK KISIM)
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  location: path.resolve(__dirname, "location"),
};

module.exports = config;

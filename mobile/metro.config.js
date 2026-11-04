// A camada de dados vem do site (../src/lib/lvh), fora da pasta do app: o Metro precisa
// enxergar essa pasta e resolver o atalho @lvh/* que o tsconfig declara
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const lvh = path.resolve(__dirname, '../src/lib/lvh');
const config = getDefaultConfig(__dirname);

config.watchFolders = [...(config.watchFolders ?? []), lvh];

const resolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@lvh/')) {
    return context.resolveRequest(context, path.join(lvh, moduleName.slice('@lvh/'.length)), platform);
  }

  return (resolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;

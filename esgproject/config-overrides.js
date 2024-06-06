const { override, disableEsLint } = require('customize-cra');

const disableOverlay = () => (config) => {
  if (config.devServer) {
    config.devServer.overlay = {
      warnings: false,
      errors: false
    };
  }
  return config;
};

module.exports = override(
  disableOverlay(),
  disableEsLint()
);
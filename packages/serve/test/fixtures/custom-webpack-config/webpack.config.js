const path = require("path");
const { configBuilder } = require("@marko/build");
const { getServerConfig, getBrowserConfigs } = configBuilder({
  entry: path.join(__dirname, "target.marko"),
  production: process.env.NODE_ENV === "production"
});

module.exports = [...getBrowserConfigs(), getServerConfig()];

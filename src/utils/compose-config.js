const yaml = require("js-yaml");
const fs = require("fs");
const { resolve } = require("path");

const CONFIG_KEY = "docker_abridge";

const workingDirectory = process.env.DOCKER_ABRIDGE_WD || process.cwd();

const pathFromBase = (...args) => resolve(workingDirectory, ...args);

function readYaml(file) {
  return yaml.safeLoad(fs.readFileSync(pathFromBase(`${file}.yml`))) || {};
}

function getCurrent() {
  try {
    return readYaml("docker-compose");
  } catch (error) {
    if (error.code === "ENOENT") {
      return {}; // If the file doesn't exist return 'empty'
    }
    throw error;
  }
}

function getBase() {
  const raw = readYaml("base");
  delete raw[CONFIG_KEY];
  return raw;
}

function getService(service) {
  const raw = readYaml(`services/${service}`);
  delete raw[CONFIG_KEY];
  return raw;
}

function getBaseConfig() {
  return readYaml("base")[CONFIG_KEY];
}

function getServiceConfig(service) {
  const baseConfig = getBaseConfig();
  const serviceConfig = readYaml(`services/${service}`)[CONFIG_KEY];
  return { ...baseConfig.service_defaults, ...serviceConfig };
}

function writeComposeFile(composeConfig) {
  fs.writeFileSync(
    pathFromBase("docker-compose.yml"),
    `# This is a genereated file\n${yaml.safeDump(composeConfig)}`
  );
}

module.exports = {
  getCurrent,
  getBase,
  getService,
  getServiceConfig,
  writeComposeFile,
  pathFromBase,
};

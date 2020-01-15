const yaml = require("js-yaml");
const fs = require("fs");

const basePath = process.env.DOCKER_ABRIDGE_WD || process.cwd();

function readYaml(file) {
  return yaml.safeLoad(fs.readFileSync(`${basePath + file}.yml`)) || {};
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
  return readYaml("base");
}

function getService(service) {
  const raw = readYaml(`/services/${service}`);
  delete raw["docker-abridge"];
  return raw;
}

function getServiceConfig(service) {
  return readYaml(`/services/${service}`)["docker-abridge"];
}

function writeComposeFile(composeConfig) {
  fs.writeFileSync(
    `${basePath}docker-compose.yml`,
    `# This is a genereated file\n${yaml.safeDump(composeConfig)}`
  );
}

module.exports = {
  getCurrent,
  getBase,
  getService,
  getServiceConfig,
  writeComposeFile,
  basePath,
};

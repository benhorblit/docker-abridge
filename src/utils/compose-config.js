const yaml = require("js-yaml");
const fs = require("fs");

const basePath = process.env.DOCKER_ABRIDGE_WD || process.cwd();

function readYaml(file) {
  return yaml.safeLoad(fs.readFileSync(`${basePath + file}.yml`));
}

function getCurrent() {
  return readYaml("docker-compose");
}

function getBase() {
  return readYaml("base");
}

function getService(service) {
  return readYaml(`/services/${service}`);
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
  writeComposeFile,
  basePath,
};

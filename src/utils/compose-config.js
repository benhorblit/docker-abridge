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

function getDefaultServices() {
  const defaultServices = fs.readdirSync(`${basePath}default-services`);
  return defaultServices
    .filter(fileName => fileName.endsWith(".yml"))
    .map(fileName => fileName.substring(0, fileName.length - 4))
    .reduce((prev, curr) => {
      // eslint-disable-next-line no-param-reassign
      prev[curr] = readYaml(`default-services/${curr}`);
      return prev;
    }, {});
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
  getDefaultServices,
  writeComposeFile,
  basePath,
};

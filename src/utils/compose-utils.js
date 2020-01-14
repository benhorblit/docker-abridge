const execa = require("execa");
const { getCurrent, getBase, getService, writeComposeFile } = require("./compose-config");
const { basePath } = require("../utils/compose-config");

async function dockerComposeExec(args) {
  return execa("docker-compose", args, {
    stdio: "inherit",
    cwd: basePath,
  });
}

async function updateDeployment(args = []) {
  return dockerComposeExec(["up", "--detach", "--remove-orphans", ...args]);
}

function activateServices(requested) {
  const base = getBase();
  const services = { ...getCurrent().services, ...base.services };
  requested.sort().forEach(serviceName => {
    const serviceConfig = getService(serviceName);
    delete serviceConfig["docker-abridge"];
    services[serviceName] = serviceConfig;
  });
  base.services = services;
  writeComposeFile(base);
}

module.exports = { dockerComposeExec, updateDeployment, activateServices };

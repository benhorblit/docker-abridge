const execa = require("execa");
const { getCurrent, getBase, getService, writeComposeFile } = require("./compose-config");
const { basePath } = require("../utils/compose-config");

async function dockerComposeExec(args, stdio) {
  return execa("docker-compose", args, {
    stdio: stdio || "inherit",
    cwd: basePath,
  });
}

async function updateDeployment(args = [], forceUpdate) {
  if (forceUpdate || (await areAnyServicesRunning())) {
    return dockerComposeExec(["up", "--detach", "--remove-orphans", ...args]);
  }
  return null;
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

async function areAnyServicesRunning() {
  const runningServices = await dockerComposeExec(
    ["ps", "--services", "--filter", "status=running"],
    "pipe"
  );
  return runningServices.stdout;
}

module.exports = { dockerComposeExec, updateDeployment, activateServices };

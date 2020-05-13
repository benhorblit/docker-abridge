const execa = require("execa");
const chalk = require("chalk");
const {
  pathFromBase,
  getCurrent,
  getBase,
  getService,
  writeComposeFile,
} = require("./compose-config");

async function dockerComposeExec(args, stdio) {
  return execa("docker-compose", args, {
    stdio: stdio || "inherit",
    cwd: pathFromBase(),
  });
}

function modifyServices({ enable = [], disable = [] } = {}) {
  const currentServices = getCurrent().services || [];
  disable.forEach(serviceToDisable => {
    delete currentServices[serviceToDisable];
  });
  const finalServices = Object.keys(currentServices).concat(enable);
  updateComposeFile(finalServices);
}

function updateComposeFile(services) {
  const base = getBase();
  if (!base.services) base.services = {};

  services.sort().forEach(serviceName => {
    if (!base.services[serviceName]) {
      base.services[serviceName] = getService(serviceName);
    }
  });

  writeComposeFile(base);
}

async function updateDeployment(args = [], forceUpdate) {
  if (forceUpdate || (await areAnyServicesRunning())) {
    console.log(chalk.green("Updating deployment..."));

    // TODO This is kinda gross
    if (Object.entries(getCurrent()).length === 0) {
      writeComposeFile(getBase());
    }

    return dockerComposeExec(["up", "--detach", "--remove-orphans", ...args]);
  }
  console.log(chalk.gray("Skipping updating deployment since nothing is running."));
  return null;
}

async function areAnyServicesRunning() {
  const runningServices = await dockerComposeExec(
    ["ps", "--services", "--filter", "status=running"],
    "pipe"
  );
  return runningServices.stdout;
}

module.exports = { dockerComposeExec, modifyServices, updateDeployment };

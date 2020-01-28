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

function activateServices(requested) {
  const base = getBase();
  const services = { ...getCurrent().services, ...base.services };
  requested.sort().forEach(serviceName => {
    services[serviceName] = getService(serviceName);
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

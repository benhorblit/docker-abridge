const { Command } = require("@oclif/command");
const { updateDeployment } = require("../utils/compose-utils");
const { getCurrent, getBase, getService, writeComposeFile } = require("../utils/compose-config");

class Activate extends Command {
  static strict = false;

  async run() {
    const requested = this.parse().argv;
    const base = getBase();
    const services = { ...getCurrent().services, ...base.services };
    requested.sort().forEach(serviceName => {
      const serviceConfig = getService(serviceName);
      delete serviceConfig["docker-abridge"];
      services[serviceName] = serviceConfig;
    });
    base.services = services;
    writeComposeFile(base);
    updateDeployment();
  }
}

module.exports = Activate;

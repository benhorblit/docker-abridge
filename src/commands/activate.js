const { Command } = require("@oclif/command");
const { updateDeployment } = require("../utils/compose-utils");
const {
  getCurrent,
  getBase,
  getDefaultServices,
  getService,
  writeComposeFile,
} = require("../utils/compose-config");

class Activate extends Command {
  static strict = false;

  async run() {
    const requested = this.parse().argv;
    const base = getBase();
    let { services } = getCurrent() || {};
    if (!services) services = {};
    requested.sort().forEach(serviceName => {
      const serviceConfig = getService(serviceName);
      delete serviceConfig["docker-abridge"];
      services[serviceName] = serviceConfig;
    });
    writeComposeFile({ ...base, services: { ...getDefaultServices(), ...services } });
    updateDeployment();
  }
}

module.exports = Activate;

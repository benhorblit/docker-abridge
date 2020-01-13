const { Command } = require("@oclif/command");
const { updateDeployment } = require("../utils/compose-utils");
const { getCurrent, getBase, writeComposeFile } = require("../utils/compose-config");

class Deactivate extends Command {
  static strict = false;

  async run() {
    const requested = this.parse().argv;
    const base = getBase();
    let { services } = getCurrent() || {};
    if (!services) services = {};
    requested.forEach(serviceName => {
      delete services[serviceName];
    });
    writeComposeFile({ ...base, services });
    updateDeployment();
  }
}

module.exports = Deactivate;

const { Command } = require("@oclif/command");
const { updateDeployment } = require("../utils/compose-utils");
const { getCurrent, getBase, writeComposeFile } = require("../utils/compose-config");

class Deactivate extends Command {
  static strict = false;

  static description = `Removes services from the deployment.
If the deployment is running it will be updated after the docker-compose.yml is updated.`;

  static args = [
    { name: "services...", description: "The namees of services to remove from the deployment" },
  ];

  async run() {
    const requested = this.parse().argv;
    const base = getBase();
    let { services } = getCurrent();
    if (!services) services = {};
    requested.forEach(serviceName => {
      delete services[serviceName];
    });
    writeComposeFile({ ...base, services });
    await updateDeployment();
  }
}

module.exports = Deactivate;

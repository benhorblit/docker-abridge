const { Command } = require("@oclif/command");
const { modifyServices, updateDeployment } = require("../utils/compose-utils");

class Refresh extends Command {
  static strict = false;

  static description = `Refreshes the docker-compose.yml to use current configuration.
If the deployment is running it will be updated after the docker-compose.yml is updated.`;

  async run() {
    modifyServices();
    await updateDeployment();
  }
}

module.exports = Refresh;

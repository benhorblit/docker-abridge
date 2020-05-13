const { Command } = require("@oclif/command");
const { modifyServices, updateDeployment } = require("../utils/compose-utils");

class Disable extends Command {
  static strict = false;

  static description = `Removes services from the deployment.
If the deployment is running it will be updated after the docker-compose.yml is updated.`;

  static args = [
    { name: "services...", description: "The names of services to remove from the deployment" },
  ];

  async run() {
    modifyServices({ disable: this.parse().argv });
    await updateDeployment();
  }
}

module.exports = Disable;

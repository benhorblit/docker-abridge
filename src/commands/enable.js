const { Command } = require("@oclif/command");
const { activateServices, updateDeployment } = require("../utils/compose-utils");

class Enable extends Command {
  static strict = false;

  static description = `Adds services to the deployment.
If the deployment is running it will be updated after the docker-compose.yml is updated.`;

  static args = [
    { name: "services...", description: "The names of services to add to the deployment" },
  ];

  async run() {
    activateServices(this.parse().argv);
    await updateDeployment();
  }
}

module.exports = Enable;

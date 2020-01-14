const DockerComposeCommand = require("../utils/docker-compose-command");
const { updateDeployment, activateServices } = require("../utils/compose-utils");

class Build extends DockerComposeCommand {
  static strict = false;

  async run() {
    activateServices(this.parse().argv);
    await this.dockerCompose("build");
    updateDeployment();
  }
}

module.exports = Build;

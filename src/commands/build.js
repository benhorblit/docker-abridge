const DockerComposeCommand = require("../utils/docker-compose-command");
const { updateDeployment } = require("../utils/compose-utils");

class Build extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("build");
    updateDeployment();
  }
}

module.exports = Build;

const DockerComposeCommand = require("../utils/docker-compose-command");
const { updateDeployment } = require("../utils/compose-utils");

class Up extends DockerComposeCommand {
  static strict = false;

  static description = `Passthrough to 'docker-compose up'.
  Default flags: --detach --remove-orphans`;

  async run() {
    await updateDeployment(this.parse().argv, true);
  }
}

module.exports = Up;

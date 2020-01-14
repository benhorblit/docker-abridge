const DockerComposeCommand = require("../utils/docker-compose-command");
const { updateDeployment } = require("../utils/compose-utils");

class Up extends DockerComposeCommand {
  static strict = false;

  async run() {
    await updateDeployment(this.parse().argv, true);
  }
}

module.exports = Up;

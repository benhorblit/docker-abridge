const DockerComposeCommand = require("../utils/docker-compose-command");
const { updateDeployment } = require("../utils/compose-utils");

class Up extends DockerComposeCommand {
  static strict = false;

  async run() {
    updateDeployment(this.parse().argv);
  }
}

module.exports = Up;

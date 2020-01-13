const DockerComposeCommand = require("../utils/docker-compose-command");

class Up extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("up", "--detach", "--remove-orphans");
  }
}

module.exports = Up;

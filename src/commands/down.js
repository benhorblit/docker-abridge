const DockerComposeCommand = require("../utils/docker-compose-command");

class Down extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("down", "--volumes", "--remove-orphans");
  }
}

module.exports = Down;

const DockerComposeCommand = require("../utils/docker-compose-command");

class Start extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("start");
  }
}

module.exports = Start;

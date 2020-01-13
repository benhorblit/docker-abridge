const DockerComposeCommand = require("../utils/docker-compose-command");

class Stop extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("stop");
  }
}

module.exports = Stop;

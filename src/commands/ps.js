const DockerComposeCommand = require("../utils/docker-compose-command");

class Ps extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("ps");
  }
}

module.exports = Ps;

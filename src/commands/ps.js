const DockerComposeCommand = require("../utils/docker-compose-command");

class Ps extends DockerComposeCommand {
  static strict = false;

  static description = "Passthrough to 'docker-compose ps'.";

  async run() {
    await this.dockerCompose("ps");
  }
}

module.exports = Ps;

const DockerComposeCommand = require("../utils/docker-compose-command");

class Stop extends DockerComposeCommand {
  static strict = false;

  static description = "Passthrough to 'docker-compose stop'.";

  async run() {
    await this.dockerCompose("stop");
  }
}

module.exports = Stop;

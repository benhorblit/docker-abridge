const DockerComposeCommand = require("../utils/docker-compose-command");

class Start extends DockerComposeCommand {
  static strict = false;

  static description = "Passthrough to 'docker-compose start'.";

  async run() {
    await this.dockerCompose("start");
  }
}

module.exports = Start;

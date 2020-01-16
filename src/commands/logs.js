const DockerComposeCommand = require("../utils/docker-compose-command");

class Logs extends DockerComposeCommand {
  static strict = false;

  static description = `Passthrough to 'docker-compose logs'.
  Default flags: --follow --tail=30`;

  async run() {
    await this.dockerCompose("logs", "--follow", "--tail=30");
  }
}

module.exports = Logs;

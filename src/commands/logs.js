const DockerComposeCommand = require("../utils/docker-compose-command");

class Logs extends DockerComposeCommand {
  static strict = false;

  static description = `Passthrough to 'docker-compose logs'.
  Default flags: --follow`;

  async run() {
    await this.dockerCompose("logs", "--follow");
  }
}

module.exports = Logs;

const DockerComposeCommand = require("../utils/docker-compose-command");

class Logs extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("logs", "-f");
  }
}

module.exports = Logs;

const DockerComposeCommand = require("../utils/docker-compose-command");

class Direct extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose([]);
  }
}

module.exports = Direct;

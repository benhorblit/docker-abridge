const DockerComposeCommand = require("../utils/docker-compose-command");

class Services extends DockerComposeCommand {
  static strict = false;

  async run() {
    await this.dockerCompose("ps", "--services");
  }
}

module.exports = Services;

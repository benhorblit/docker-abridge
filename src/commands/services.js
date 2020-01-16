const DockerComposeCommand = require("../utils/docker-compose-command");

class Services extends DockerComposeCommand {
  static description = "Lists the services currently present in the docker-compose.yml.";

  async run() {
    await this.dockerCompose("ps", "--services");
  }
}

module.exports = Services;

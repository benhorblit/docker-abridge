const DockerComposeCommand = require("../utils/docker-compose-command");

class Down extends DockerComposeCommand {
  static strict = false;

  static description = `Passthrough to 'docker-compose down'.
  Default flags: --volumes --remove-orphans`;

  async run() {
    await this.dockerCompose("down", "--volumes", "--remove-orphans");
  }
}

module.exports = Down;

const DockerComposeCommand = require("../utils/docker-compose-command");

class Direct extends DockerComposeCommand {
  static strict = false;

  static description = "Direct passthrough to docker-compose.";

  static examples = ["$ docker-abridge top", "$ docker-abridge exec psql -d database -U  user -W"];

  async run() {
    await this.dockerCompose([]);
  }
}

module.exports = Direct;

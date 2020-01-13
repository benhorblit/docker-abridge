const { Command } = require("@oclif/command");
const execa = require("execa");
const { basePath } = require("../utils/compose-config");

const dockerCompose = (...args) =>
  execa("docker-compose", ...args, {
    stdio: "inherit",
    cwd: basePath,
  });

class DockerComposeCommand extends Command {
  dockerCompose(...args) {
    return dockerCompose([...args, ...this.parse().argv]);
  }
}

module.exports = DockerComposeCommand;

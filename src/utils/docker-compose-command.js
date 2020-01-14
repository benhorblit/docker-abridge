const { Command } = require("@oclif/command");
const { dockerComposeExec } = require("./compose-utils");

class DockerComposeCommand extends Command {
  async dockerCompose(...args) {
    return dockerComposeExec([...args, ...this.parse().argv]);
  }
}

module.exports = DockerComposeCommand;

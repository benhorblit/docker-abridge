const { Command } = require("@oclif/command");
const { dockerComposeExec } = require("./compose-utils");

class DockerComposeCommand extends Command {
  dockerCompose(...args) {
    return dockerComposeExec([...args, ...this.parse().argv]);
  }
}

module.exports = DockerComposeCommand;

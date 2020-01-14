const { Command } = require("@oclif/command");
const { activateServices, updateDeployment } = require("../utils/compose-utils");

class Activate extends Command {
  static strict = false;

  async run() {
    activateServices(this.parse().argv);
    updateDeployment();
  }
}

module.exports = Activate;

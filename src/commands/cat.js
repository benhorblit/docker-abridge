const { Command, flags } = require("@oclif/command");
const chalk = require("chalk");
const { readRawYaml } = require("../utils/compose-config");

class Cat extends Command {
  static strict = false;

  static description = `Prints pieces of configuration.
If no services or flags are passed the current docker-compose.yml will be printed.`;

  static args = [
    { name: "services...", description: "The namees of services to print configuration for" },
  ];

  static flags = {
    base: flags.boolean({
      description: "Include the contents of the base yaml configuration.",
    }),
    raw: flags.boolean({
      description: "Print the raw config without any headers.",
    }),
  };

  async run() {
    const { argv, ...parsed } = this.parse();
    const { base, raw } = parsed.flags;

    if (!base && argv.length === 0) {
      console.log(readRawYaml("docker-compose"));
    }

    if (base) {
      if (!raw) {
        console.log(chalk.bold.blue("❯ base.yml"));
      }
      console.log(readRawYaml("base"));
    }

    argv.forEach(service => {
      if (!raw) {
        console.log(chalk.bold.yellow(`❯ ${service}.yml`));
      }
      console.log(readRawYaml(`services/${service}`));
    });
  }
}

module.exports = Cat;

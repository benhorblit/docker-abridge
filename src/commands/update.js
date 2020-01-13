const { Command } = require("@oclif/command");
const fs = require("fs");
const execa = require("execa");
const Build = require("./build");
const { getService, basePath } = require("../utils/compose-config");

class Update extends Command {
  static strict = false;

  async run() {
    const requested = this.parse().argv;

    requested.sort().forEach(serviceName => {
      const abridgeConfig = getService(serviceName)["docker-abridge"];

      const [buildCommand, ...buildArgs] = abridgeConfig.build;
      execa(buildCommand, buildArgs, {
        stdio: "inherit",
        cwd: abridgeConfig.context,
      });

      const artifactsDir = abridgeConfig.context + abridgeConfig.artifacts;
      fs.readdirSync(artifactsDir).forEach(file =>
        fs.copyFileSync(artifactsDir + file, `${basePath}/docker/artifacts/${file}`)
      );
    });

    Build.run(requested);
  }
}

module.exports = Update;

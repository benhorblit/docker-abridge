const { Command } = require("@oclif/command");
const fs = require("fs");
const path = require("path");
const execa = require("execa");
const Build = require("./build");
const { getService, basePath } = require("../utils/compose-config");

class Update extends Command {
  static strict = false;

  async run() {
    const requested = this.parse().argv;

    requested.sort().forEach(async serviceName => {
      const abridgeConfig = getService(serviceName)["docker-abridge"];

      const [buildCommand, ...buildArgs] = abridgeConfig.build;
      await execa(buildCommand, buildArgs, {
        stdio: "inherit",
        cwd: path.resolve(basePath, abridgeConfig.context),
      });

      const artifactsDir = path.resolve(basePath, abridgeConfig.context, abridgeConfig.artifacts);
      fs.readdirSync(artifactsDir).forEach(file =>
        fs.copyFileSync(
          path.resolve(artifactsDir, file),
          path.resolve(basePath, "./docker/artifacts", file)
        )
      );
    });

    Build.run(requested);
  }
}

module.exports = Update;

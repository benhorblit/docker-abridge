const { Command } = require("@oclif/command");
const fs = require("fs");
const { resolve } = require("path");
const execa = require("execa-output");
const Listr = require("listr");
const { Observable } = require("rxjs");
const { getService, basePath } = require("../utils/compose-config");

class Update extends Command {
  static strict = false;

  async run() {
    const requested = this.parse().argv;

    const tasks = new Listr(
      requested.map(serviceName => ({
        title: `Update ${serviceName}`,
        task: (context, task) => {
          const abridgeConfig = getService(serviceName)["docker-abridge"];
          return new Listr([
            {
              title: "Execute build command",
              task: () => {
                const [buildCommand, ...buildArgs] = abridgeConfig.build;
                return execa(buildCommand, buildArgs, {
                  cwd: resolve(basePath, abridgeConfig.context),
                });
              },
            },
            {
              title: "Copy artifacts",
              task: () => {
                return new Observable(observer => {
                  observer.next("Copying...");
                  const artifactsDir = resolve(
                    basePath,
                    abridgeConfig.context,
                    abridgeConfig.artifacts
                  );
                  fs.readdirSync(artifactsDir).forEach(file =>
                    fs.copyFileSync(
                      resolve(artifactsDir, file),
                      resolve(basePath, "./docker/artifacts", file)
                    )
                  );
                  observer.complete();
                  task.title = `${serviceName} updated`; // eslint-disable-line no-param-reassign
                });
              },
            },
          ]);
        },
      })),
      { concurrent: 2 }
    );

    tasks.run().catch(console.error);
  }
}

module.exports = Update;

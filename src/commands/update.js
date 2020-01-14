const { Command } = require("@oclif/command");
const fs = require("fs");
const path = require("path");
const execa = require("execa-output");
const Listr = require("listr");
const { Observable } = require("rxjs");
// const Build = require("./build");
const { getService, basePath } = require("../utils/compose-config");

class Update extends Command {
  static strict = false;

  async run() {
    const requested = this.parse().argv;

    const tasks = new Listr(
      requested.map(serviceName => ({
        title: serviceName,
        task: () => {
          const abridgeConfig = getService(serviceName)["docker-abridge"];
          return new Listr([
            {
              title: `Build ${serviceName}`,
              task: () => {
                const [buildCommand, ...buildArgs] = abridgeConfig.build;
                return execa(buildCommand, buildArgs, {
                  cwd: path.resolve(basePath, abridgeConfig.context),
                });
              },
            },
            {
              title: `Copy ${serviceName} artifacts`,
              task: () => {
                return new Observable(observer => {
                  observer.next("Copying...");
                  const artifactsDir = path.resolve(
                    basePath,
                    abridgeConfig.context,
                    abridgeConfig.artifacts
                  );
                  fs.readdirSync(artifactsDir).forEach(file =>
                    fs.copyFileSync(
                      path.resolve(artifactsDir, file),
                      path.resolve(basePath, "./docker/artifacts", file)
                    )
                  );
                  observer.complete();
                });
              },
            },
          ]);
        },
      })),
      { concurrent: 2 }
    );

    tasks.run().catch(console.error);

    // await Promise.all(
    //   requested.sort().map(async serviceName => {
    //     const abridgeConfig = getService(serviceName)["docker-abridge"];

    //     const [buildCommand, ...buildArgs] = abridgeConfig.build;
    //     await execa(buildCommand, buildArgs, {
    //       stdio: "inherit",
    //       cwd: path.resolve(basePath, abridgeConfig.context),
    //     });

    //     const artifactsDir = path.resolve(basePath, abridgeConfig.context, abridgeConfig.artifacts);
    //     fs.readdirSync(artifactsDir).forEach(file =>
    //       fs.copyFileSync(
    //         path.resolve(artifactsDir, file),
    //         path.resolve(basePath, "./docker/artifacts", file)
    //       )
    //     );
    //   })
    // );

    // Build.run(requested);
  }
}

module.exports = Update;

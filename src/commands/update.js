const { Command } = require("@oclif/command");
const fs = require("fs");
const { resolve } = require("path");
const execao = require("execa-output");
const Listr = require("listr");
const { Observable } = require("rxjs");
const { getService, basePath } = require("../utils/compose-config");
const { activateServices, updateDeployment } = require("../utils/compose-utils");

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
                return execao(buildCommand, buildArgs, {
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
                  fs.readdirSync(artifactsDir).forEach(file => {
                    observer.next(`Copying ${file}`);
                    fs.copyFileSync(
                      resolve(artifactsDir, file),
                      resolve(basePath, "./docker/artifacts", file)
                    );
                  });
                  observer.complete();
                });
              },
            },
            {
              title: "Build image",
              task: () => {
                activateServices([serviceName]);
                const buildObservable = execao("docker-compose", ["build", serviceName], {
                  cwd: basePath,
                });
                buildObservable.subscribe({
                  complete: () => {
                    // eslint-disable-next-line no-param-reassign
                    task.title = `Ready to deploy ${serviceName}`;
                  },
                });
                return buildObservable;
              },
            },
          ]);
        },
      })),
      { concurrent: 2 }
    );

    await tasks.run().catch(console.error);

    await updateDeployment();
  }
}

module.exports = Update;

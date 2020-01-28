const { Command } = require("@oclif/command");
const fs = require("fs");
const { resolve } = require("path");
const execao = require("execa-output");
const Listr = require("listr");
const { Observable } = require("rxjs");
const { getServiceConfig, pathFromBase } = require("../utils/compose-config");
const { activateServices, updateDeployment } = require("../utils/compose-utils");

class Update extends Command {
  static strict = false;

  static description = `Updates the service images with the latest builds.
Based on the configuration in the service yamls (and the defaults in the
base yaml) docker-abridge will attempt to execute the given build command
in the provided context. It will then copy the artifacts from the
specified location into the docker/artifacts/ directory within the project.
Once the build artifacts have been copied the image will be rebuilt and the
deployment will be updated.

By passing multiple service names you can update multiple services at once.
By default 2 service images will be updated at a time. The deployment will
be updated, if it is running, once all images have been built.`;

  static args = [{ name: "services...", description: "The names services to update" }];

  async run() {
    const requested = this.parse().argv;

    const tasks = new Listr(
      requested.map(serviceName => ({
        title: `Update ${serviceName}`,
        task: (context, task) => {
          const abridgeConfig = getServiceConfig(serviceName);
          return new Listr([
            {
              title: "Execute build command",
              task: () => {
                const [buildCommand, ...buildArgs] = abridgeConfig.build;
                return execao(buildCommand, buildArgs, {
                  cwd: pathFromBase(abridgeConfig.context),
                });
              },
            },
            {
              title: "Copy artifacts",
              task: () => {
                return new Observable(observer => {
                  observer.next("Copying...");
                  const artifactsDir = pathFromBase(abridgeConfig.context, abridgeConfig.artifacts);
                  fs.readdirSync(artifactsDir).forEach(file => {
                    observer.next(`Copying ${file}`);
                    fs.copyFileSync(
                      resolve(artifactsDir, file),
                      pathFromBase("./docker/artifacts", file)
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
                  cwd: pathFromBase(),
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

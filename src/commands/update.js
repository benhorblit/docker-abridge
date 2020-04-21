/* eslint-disable global-require */
const { Command, flags } = require("@oclif/command");
const fs = require("fs");
const chalk = require("chalk");
const { resolve } = require("path");
const execao = require("execa-output");
const Listr = require("listr");
const { Observable } = require("rxjs");
const { first, last } = require("rxjs/operators");
const { getServiceDefinition, getServiceConfig, pathFromBase } = require("../utils/compose-config");
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
You can pass services with the --remote flag that will be updated simply by
pulling the latest image from the remote repository.

By default 2 service images will be updated at a time. The deployment will 
be updated, if it is running, once all images have been built.`;

  static args = [{ name: "services...", description: "The names services to update" }];

  static flags = {
    verbose: flags.boolean({
      char: "v",
      description:
        "Enable verbose output that shows everything printed during the build. Useful for debugging.",
    }),
    remote: flags.string({
      char: "r",
      multiple: true,
      description:
        "The names of services to update by simply pulling from the remote repository instead of executing a build.",
    }),
  };

  async run() {
    const {
      argv: requested = [],
      flags: { verbose, remote: remotes = [] },
    } = this.parse();

    const tasks = new Listr(
      Array.prototype
        .concat(
          requested.map(serviceName => ({ serviceName, remote: false })),
          remotes.map(serviceName => ({ serviceName, remote: true }))
        )
        .map(({ serviceName, remote }) => ({
          title: `Update ${chalk.bold.blue(serviceName)}`,
          task: (context, task) => {
            const abridgeConfig = getServiceConfig(serviceName);
            return remote
              ? new Listr([
                  {
                    title: "Pull image from remote",
                    task: () => {
                      activateServices([serviceName]);
                      const pullObservable = execao("docker", [
                        "pull",
                        getServiceDefinition(serviceName).image,
                      ]);
                      pullObservable.pipe(first()).subscribe(() => {
                        // eslint-disable-next-line no-param-reassign
                        task.title = `Updating ${chalk.bold.yellow(serviceName)}`;
                      });
                      pullObservable.pipe(last()).subscribe(() => {
                        // eslint-disable-next-line no-param-reassign
                        task.title = `Ready to deploy ${chalk.bold.green(serviceName)}`;
                      });
                      return pullObservable;
                    },
                  },
                ])
              : new Listr(
                  [
                    {
                      title: "Execute build command",
                      task: () => {
                        const [buildCommand, ...buildArgs] = abridgeConfig.build;
                        const buildObservable = execao(buildCommand, buildArgs, {
                          cwd: pathFromBase(abridgeConfig.context),
                        });
                        buildObservable.pipe(first()).subscribe(() => {
                          // eslint-disable-next-line no-param-reassign
                          task.title = `Updating ${chalk.bold.yellow(serviceName)}`;
                        });
                        return buildObservable;
                      },
                    },
                    {
                      title: "Copy artifacts",
                      task: () => {
                        return new Observable(observer => {
                          observer.next("Copying...");
                          const artifactsDir = pathFromBase(
                            abridgeConfig.context,
                            abridgeConfig.artifacts
                          );
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
                        const imageBuildObservable = execao(
                          "docker-compose",
                          ["build", serviceName],
                          {
                            cwd: pathFromBase(),
                          }
                        );
                        imageBuildObservable.pipe(last()).subscribe(() => {
                          // eslint-disable-next-line no-param-reassign
                          task.title = `Ready to deploy ${chalk.bold.green(serviceName)}`;
                        });
                        return imageBuildObservable;
                      },
                    },
                  ],
                  {
                    exitOnError: true,
                    renderer: verbose ? require("listr-verbose-renderer") : undefined,
                  }
                );
          },
        })),
      {
        concurrent: verbose ? 1 : 2,
        exitOnError: false,
        renderer: verbose ? require("listr-verbose-renderer") : undefined,
      }
    );

    await tasks.run().catch(console.error);

    await updateDeployment();
  }
}

module.exports = Update;

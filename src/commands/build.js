const DockerComposeCommand = require("../utils/docker-compose-command");
const { updateDeployment, activateServices } = require("../utils/compose-utils");

class Build extends DockerComposeCommand {
  static strict = false;

  static description = `Passthrough to 'docker-compose build'.
Activates any given services prior to building to make sure they are present in the
docker-compose.yml. Will attempt to update the deployment after building if deployment
is running.`;

  async run() {
    activateServices(this.parse().argv);
    await this.dockerCompose("build");
    console.log();
    await updateDeployment();
  }
}

module.exports = Build;

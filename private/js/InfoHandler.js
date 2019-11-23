const fs = require("fs");
const PathHandler = require("./PathHandler");

module.exports = class InfoHandler {
  constructor(username, projectName, repoPath) {
    // Temporary fix: change repoPath to project path, so we can use pathHandler for now.
    const pathArray = repoPath.split("/");
    const projectPath = pathArray.slice(0, -1).join("/");

    // This handler handles all paths regarding the current project
    this.pathHandler = PathHandler(username, projectName, projectPath);

    /* Save info.json */
    // If info.json doesn't exist, write a fresh one.
    if (!fs.existsSync(this.pathHandler.getInfoJSONPath())) {
      const freshInfoJSON = {
        username,
        projectName,
        head: null,
        labels: [],
        manifests: []
      };

      fs.writeFileSync(
        this.pathHandler.getInfoJSONPath(),
        JSON.stringify(freshInfoJSON)
      );
    }
    // Grab info.json from user's project folder
    this.infoJSON = JSON.parse(
      fs.readFileSync(this.pathHandler.getInfoJSONPath())
    );
  }

  addLabel(manifestID, label) {
    this.infoJSON.labels.push({ [label]: manifestID });
    this.write();
  }

  addManifest(manifestID, manifestPath) {
    this.infoJSON.manifests.push({ manifestID, manifestPath });
    this.infoJSON.head = manifestID;

    this.write();
  }

  getCurrentHead() {
    return this.getInfoOBject().head;
  }

  getInfoOBject() {
    return JSON.parse(fs.readFileSync(this.pathHandler.getInfoJSONPath()));
  }

  write() {
    fs.writeFileSync(
      this.pathHandler.getInfoJSONPath(),
      JSON.stringify(this.infoJSON)
    );
  }
};

const { fs, path, VSC_REPO_NAME } = require("./");
const PathHandler = require("./PathHandler");

module.exports = class InfoHandler {
  constructor(username, projectName, repoPath) {
    // Temporary fix: change repoPath to project path, so we can use pathHandler for now.
    const projectPath = repoPath
      .split(path.sep)
      .slice(0, -1)
      .join(path.sep);

    // This handler handles all paths regarding the current project
    this.pathHandler = PathHandler(username, projectName, projectPath);

    // If info.json doesn't exist, write a fresh one.
    if (!fs.existsSync(this.pathHandler.getInfoJSONPath())) {
      fs.writeFileSync(
        this.pathHandler.getInfoJSONPath(),
        JSON.stringify({
          username,
          projectName,
          head: null,
          labels: [],
          manifests: []
        })
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

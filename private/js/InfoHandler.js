const fs = require("fs");
const path = require("path");

module.exports = class InfoHandler {
  constructor(username, projectName, repoPath) {
    console.log("(IM) repoPath=" + repoPath);

    this.infoJSON = {
      username,
      projectName,
      head: null
    };
    this.repoPath = repoPath;
  }

  addLabel(manifestID, label) {
    if (!this.infoJSON.labels) {
      this.infoJSON.labels = [];
    }
    this.infoJSON.labels.push({ label, manifestID });
    this.write();
  }

  addManifest(manifestID, manifestPath) {
    // Grab current info.json from the repo
    const currentInfoJSON = this.getInfoOBject();

    // If it exists, set to it, or else, set to default
    this.infoJSON = currentInfoJSON ? currentInfoJSON : this.infoJSON;

    console.log(
      "(addManifest), this.infoJSON.manifests=" +
        JSON.stringify(this.infoJSON.manifests)
    );
    if (!this.infoJSON.manifests) {
      this.infoJSON.manifests = [];
    }
    this.infoJSON.manifests.push({ manifestID, manifestPath });
    this.infoJSON.head = manifestID;
    this.write();
  }

  getCurrentHead() {
    return this.getInfoOBject().head;
  }

  getInfoOBject() {
    return JSON.parse(fs.readFileSync(path.join(this.repoPath, "info.json")));
  }

  write() {
    fs.writeFileSync(
      path.join(this.repoPath, "info.json"),
      JSON.stringify(this.infoJSON)
    );
  }
};

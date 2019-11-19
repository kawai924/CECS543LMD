const fs = require("fs");
const path = require("path");

module.exports = class InfoManifest {
  constructor(username, projectName, repoPath) {
    console.log("(IM) repoPath=" + repoPath);

    this.infoJSON = {
      username,
      projectName,
      labels: [],
      manifests: [],
      head: null
    };
    this.repoPath = repoPath;
  }

  addLabel(manifestID, label) {
    this.infoJSON.labels.push({ label, manifestID });
    this.write();
  }

  addManifest(manifestID, manifestPath) {
    this.infoJSON.manifests.push({ manifestID, manifestPath });
    this.infoJSON.head = manifestID;
    this.write();
  }

  getCurrentHead() {
    return JSON.parse(fs.readFileSync(path.join(this.repoPath, "info.json")))
      .head;
  }

  write() {
    // Check if manifest folder exists
    if (!fs.existsSync(this.repoPath)) {
      throw new Error("Manifest Folder doesn't exists...");
    }

    fs.writeFileSync(
      path.join(this.repoPath, "info.json"),
      JSON.stringify(this.infoJSON)
    );
  }
};

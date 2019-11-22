module.exports = class RepoHandler {
  constructor(username, repoName, projectPath) {
    // Store all properties regarding about the current repo
    this.repo = {
      username,
      repoName,
      projectPath
    };
  }

  /* Utility functions
   *******************/
  create() {
    console.log(`Create repo`);
  }

  addLabel(manifestID, label) {}

  checkout(sourceProjectPath, sourceManifestID) {
    console.log(`checkout ${sourceProjectPath} ${sourceManifestID}`);
  }

  checkin() {
    console.log("Checkin the repo");
  }
};

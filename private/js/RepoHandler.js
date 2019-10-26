const fs = require("fs");
const path = require("path");

const createArtifactId = require("./Artifact");
const Manifest = require("./Manifest");
const { Queue } = require("./Queue");
const ff = require("./FolderFunctions");
const constants = require("../../server/constants");

class RepoHandler {
  constructor(userName = "john_doe", repoName = "foo", command = "create") {
    // source path = testing/[repoName]
    const sourceRepoPath = path.join(constants.TESTPATH, this.repo.repoName);

    // dest path = [ROOT]/database/[username]/[repoName]
    const destRepoPath = path.join(
      constants.ROOTPATH,
      "database",
      this.repo.userName,
      this.repo.repoName
    );

    // If command === create, it's a new repo
    let isNew = command === "create" ? true : false;

    this.repo = {
      isNew: isNew,
      userName: userName,
      repoName: repoName,
      command: command,
      sourceRepoPath: sourceRepoPath,
      destRepoPath: destRepoPath
    };

    // Set up manifest object to store new manifest
    this.manifest = new Manifest(this.repo.command, destRepoPath);
  }

  init() {
    // For new repo
    if (this.repo.isNew) {
      // Create repo folder under database/[userName]/[repoName]
      ff.makeDir(destPath, { recursive: true });
      // Create folder named "manifests" with path: database/[userName]/[repoName]/manifests
      ff.makeDir(path.join(destPath, "manifests"), {
        recursive: true
      });
    }

    // Initialize manifest object after database/[repo] exists
    this.manifest.init();
  }

  copySourceToDest() {
    try {
      //Actual copying source repo to destination repo
      ff.copyFolderTree(
        this.repo.sourceRepoPath,
        this.repo.destRepoPath,
        this.manifest
      );

      // Finish writing manifest object
      manifestObject.complete();
    } catch (err) {
      console.log("Fail to copy source to dest and write manifest file");
      console.log("ERROR: ", err);
    }
  }
}

const fs = require("fs");
const path = require("path");

const createArtifactId = require("./Artifact");
const Manifest = require("./Manifest");
const { Queue } = require("./Queue");
const ff = require("./FolderFunctions");
const constants = require("../../server/constants");

/**
 * RepoHandler is supposed to coordinate between manifest and copying repo.
 * Everything is setup internally.
 *
 * To use RepoHandler,
 *  - Constructor take 3 params: userName, repoName, and command
 *      (command will be received from website from either button, checkbox...)
 */
class RepoHandler {
  constructor(userName = "john_doe", repoName = "foo", command = "create") {
    // source path = testing/[repoName]
    const sourceRepoPath = path.join(constants.TESTPATH, repoName);

    // dest path = [ROOT]/database/[username]/[repoName]
    const destRepoPath = path.join(
      constants.ROOTPATH,
      "database",
      userName,
      repoName
    );

    // Can't create an existing repo of the same name under same user
    // Throw error
    if (command === "create" && fs.existsSync(destRepoPath)) {
      throw new Error("Repo already exists");
    }

    // Store all properties regarding about the current repo
    this.repo = {
      userName: userName,
      repoName: repoName,
      command: command,
      sourceRepoPath: sourceRepoPath,
      destRepoPath: destRepoPath
    };

    // Set up an manifest instance
    this.manifest = new Manifest(this.repo.command, destRepoPath);
  }

  /* Create Functionality
---------------------------- */
  /* Create repo and manifest folder at destination, then initialize manifest instance. */
  initializeForCreate() {
    // Create repo folder under database/[userName]/[repoName]
    ff.makeDir(this.repo.destRepoPath, { recursive: true });
    // Create folder named "manifests" with path: database/[userName]/[repoName]/manifests
    ff.makeDir(path.join(this.repo.destRepoPath, "manifests"), {
      recursive: true
    });
    // Initialize manifest instance after database/[repo] exists
    this.manifest.initialize();
  }

  /* Actuallly copying source repo to destination repo and finalize writing manifest */
  copySourceToDest() {
    // Get ready before copying source to destination
    this.initializeForCreate();

    try {
      //Actual copying source repo to destination repo
      ff.copyFolderTree(
        this.repo.sourceRepoPath,
        this.repo.destRepoPath,
        this.manifest
      );

      // Finish writing manifest instance
      this.manifest.finalize();
    } catch (err) {
      console.log("Fail to copy source to dest and write manifest file");
      console.log("ERROR: ", err);
    }
  }

  /* Label Functionality
  ---------------------------- */
  addLabel(manifestProp, label) {
    this.manifest.addLabel(manifestProp, label);
  }

  /* Checkout Functionality (not tested)
---------------------------- */
  checkoutManifestByID(manifestID, targetPath) {
    const masterManifest = this.manifest.getMasterManifest();
    const manifestItem = masterManifest.manifest_lists[manifestID];

    // If the manifest doesn't exist, throw error
    if (!manifestItem) throw new Error("Manifest not found");

    // Actually recreate the repo into the targetPath
    recreateRepo(manifestItem, targetPath);
  }

  // Use the manifest as blueprint to recreate repo in the targetPath
  recreateRepo(manifest, targetPath) {}
}

const filePath = path.join(constants.ROOTPATH, "database", "liam", "Test_user");

module.exports = RepoHandler;

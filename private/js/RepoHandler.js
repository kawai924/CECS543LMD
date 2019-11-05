const fs = require('fs');
const path = require('path');
const Manifest = require('./Manifest');
const ff = require('./FolderFunctions');
const constants = require('../../server/constants');

/**
 * RepoHandler handles all methods regarding repos.
 * Supports create(), checkoutByID()
 */
class RepoHandler {
  constructor(userName, repoName) {
    // For testing purpose, put all testing repos in testing folder
    // source path = testing/[repoName]
    // dest path = [ROOT]/database/[username]/[repoName]
    const defaultSourcePath = path.join(constants.ROOTPATH, 'testing');

    // Store all properties regarding about the current repo
    this.repo = {
      userName,
      repoName,
      sourceRepoPath: path.join(defaultSourcePath, repoName),
      destRepoPath: path.join(
        constants.ROOTPATH,
        'database',
        userName,
        repoName
      )
    };

    // Create a new manifest handler
    this.manifestHandler = new Manifest({
      userName,
      repoName,
      destRepoPath: this.repo.destRepoPath
    });
  }

  /* Create Functionality
---------------------------- */
  create() {
    // Add command to new manifest
    this.manifestHandler.addCommand('create');

    //Actual copying source repo to destination repo
    const folderStructure = ff.copyFolderTreeWithMemoization(
      this.repo.sourceRepoPath,
      this.repo.destRepoPath
    );
    this.manifestHandler.addStructure(folderStructure);

    // Create new manifest
    this.manifestHandler.write();
  }

  /* Label Functionality
  ---------------------------- */
  addLabel(manifestProp, label) {
    this.manifestHandler.addLabel(manifestProp, label);
  }

  /* Checkout Functionality
  * Missing feature: The checkout command also creates a new manifest file, of the checked out version, in the repo. The user should be able to specify the manifest file using a label, if it has one.
---------------------------- */
  // Set up checkout by ID
  checkout(manifestID, destPath) {
    // Add command to new manifest
    this.manifestHandler.addCommand('checkout');

    const manifestPath = this.manifestHandler.getManifestPath(manifestID);

    // Grab structure from parsed manifest file
    const { structure } = JSON.parse(fs.readFileSync(manifestPath));

    structure.forEach(item => {
      // Use regrex to grab the path of the folder after /database
      const regrexForFolder = /(?<=database).*/;
      const relativeDestPath = regrexForFolder.exec(item.artifactAbsPath)[0];

      // Append the folder path with the new target path
      const newDestPath = path.join(destPath, relativeDestPath);
      // Recursively make folders in the destination
      ff.makeDir(newDestPath);

      // Regrex to get the filename from leaf folder
      const regrexForFileName = /.+(?=\/)/;
      // If no match, return null
      const fileNameMatches = regrexForFileName.exec(item.artifactNode);

      // If there is a file in the repo folder
      if (fileNameMatches) {
        // Grab fileName from regrex
        const fileName = fileNameMatches[0];
        // Get full file path from source
        const fileSource = path.join(item.artifactAbsPath, item.artifactNode);
        // Create full file path to destination
        const fileDest = path.join(newDestPath, fileName);
        // Copy the file
        fs.copyFileSync(fileSource, fileDest);
      }
    });

    // Copy the structure that uses to checkout
    this.manifestHandler.addStructure(structure);
    // Write a new manifest into file.
    this.manifestHandler.write({ checkoutPath: destPath });
  }
}

module.exports = RepoHandler;

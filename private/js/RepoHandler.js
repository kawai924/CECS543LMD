const fs = require('fs');
const path = require('path');

const Manifest = require('./ManifestHandler');
const { copyFolderTreeWithMemoization, makeDir } = require('./FolderFunctions');
const ROOTPATH = path.join(__dirname, '..', '..');

/* RepoHandler handles all methods regarding repos. */
module.exports = class RepoHandler {
  constructor(userName, repoName, { sourcePath }) {
    // Store all properties regarding about the current repo
    this.repo = {
      userName,
      repoName,
      sourcePath,
      destRepoPath: path.join(ROOTPATH, 'database', userName, repoName)
    };

    // Create a new manifest handler
    this.manifestHandler = new Manifest({
      userName,
      repoName,
      destRepoPath: this.repo.destRepoPath
    });
  }

  /* Create Functionality */
  create() {
    // Add command to new manifest
    this.manifestHandler.addCommand('create');

    //Actual copying source repo to destination repo
    const folderStructure = copyFolderTreeWithMemoization(
      this.repo.sourcePath,
      this.repo.destRepoPath
    );
    // console.log(folderStructure);
    this.manifestHandler.addStructure(folderStructure);

    // Create new manifest
    this.manifestHandler.write();
  }

  /* Label Functionality */
  addLabel(manifestProp, label) {
    this.manifestHandler.addLabel(manifestProp, label);
  }

  /* Checkout Functionality */
  checkout(manifestID, destPath) {
    const { userName, repoName } = this.repo;

    // Add command to new manifest
    this.manifestHandler.addCommand('checkout');

    const manifestPath = this.manifestHandler.getManifestPath(manifestID);

    // Grab structure from parsed manifest file
    const { structure } = JSON.parse(fs.readFileSync(manifestPath));

    // Copy source file into the checkout folder
    structure.forEach(item => {
      // Use regrex to grab the path of the folder after /database
      const regrexForFolder = /(?<=database).*/;
      const relativeDestPath = regrexForFolder.exec(item.artifactAbsPath)[0];

      // Append the folder path with the new target path
      const newDestPath = path.join(destPath, relativeDestPath);
      // Recursively make folders in the destination
      makeDir(newDestPath);

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
    // HANDLE manifest for the original repo
    // Copy the structure that uses to checkout
    this.manifestHandler.addStructure(structure);
    // Write a new manifest into file.
    this.manifestHandler.write({ checkoutPath: destPath });

    // SETUP manifest structure for the checkout repo
    // Build manifest folder
    makeDir(path.join(destPath, 'manifests'));
    // Create a new manifest handler
    const repoManifest = new Manifest({
      userName,
      repoName,
      destRepoPath: path.join(destPath, userName, repoName)
    });
    // Write master manifest
    repoManifest.rewriteMasterManifest();
  }

  /* Check In */
  checkin(manifestID, destPath) {
    this.manifestHandler.addCommand('checkin');

    const folderStructure = copyFolderTreeWithMemoization(
      this.repo.sourcePath,
      destPath
    );

    this.manifestHandler.addStructure(folderStructure);

    this.manifestHandler.write();
  }
};

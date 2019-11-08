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
    console.log('checkout, destPath = ' + destPath);
    const { userName, repoName } = this.repo;

    // Add command to new manifest
    this.manifestHandler.addCommand('checkout');

    const manifestPath = this.manifestHandler.getManifestPath(manifestID);

    // Grab structure from parsed manifest file
    const { structure } = JSON.parse(fs.readFileSync(manifestPath));

    // Copy source file into the checkout folder
    structure.forEach(item => {
      console.log(`Item node = ${item.artifactNode}`);
      console.log(`Item path = ${item.artifactAbsPath}`);
      // Use regrex to grab the path of the folder after /database
      const escapedFileName = item.artifactNode
        .replace('.', '\\.')
        .replace('/', '\\/');
      console.log('escapedFileName = ' + escapedFileName);
      const folderRegrex = new RegExp(
        `(?<=${userName}).*(?=${escapedFileName})?`
      );

      const pathString = folderRegrex.exec(item.artifactAbsPath);
      const relativeDestPath = pathString ? pathString[0] : '';
      console.log('relativeDestPath = ' + relativeDestPath);

      // Append the folder path with the new target path
      const newDestPath = path.join(destPath, relativeDestPath);
      // Recursively make folders in the destination
      makeDir(newDestPath);

      // Regrex to get the filename from leaf folder
      const regrexForFileName = /.+(?=\/)/;
      // If no match, return null
      const fileNameMatches = regrexForFileName.exec(item.artifactNode);
      console.log(`fileNameMatches = ${fileNameMatches}`);

      // If there is a file in the repo folder
      if (fileNameMatches) {
        // Grab fileName from regrex
        const fileName = fileNameMatches[0];
        console.log('fileName = ' + fileName);
        // Get full file path from source
        const fileSource = path.join(item.artifactAbsPath, item.artifactNode);
        // Create full file path to destination
        // const fileDest = path.join(newDestPath, fileName);
        const fileDest = path.join(destPath, relativeDestPath);
        if (!fs.existsSync(fileDest)) {
          fs.mkdirSync(fileDest, { recursive: true });
        }

        console.log('fileSource = ' + fileSource);
        console.log('fileDest = ' + fileDest);
        // Copy the file
        fs.copyFileSync(fileSource, fileDest + fileName);
      }
      console.log('DONE-----');
      console.log(`Item node = ${item.artifactNode}`);
      console.log(`Item path = ${item.artifactAbsPath}`);
      console.log('--------------');
    });

    // HANDLE manifest for the original repo
    // Copy the structure that uses to checkout
    this.manifestHandler.addStructure(structure);
    // Write a new manifest into file.
    this.manifestHandler.write({ checkoutPath: destPath });

    console.log(`destPath = ${destPath}`);
    // Create a new manifest handler
    const repoManifest = new Manifest({
      userName,
      repoName,
      destRepoPath: path.join(destPath, repoName)
    });
    // Write master manifest
    repoManifest.rewriteMasterManifest(path.join(destPath, repoName));
  }

  /* Check In */
  checkin(sourcePath) {
    this.manifestHandler.addCommand('checkin');

    // Repo path in database
    const repoPath = path.join(
      ROOTPATH,
      'database',
      this.repo.userName,
      this.repo.repoName
    );
    const folderStructure = copyFolderTreeWithMemoization(
      this.repo.sourcePath,
      repoPath
    );

    this.manifestHandler.addStructure(folderStructure);

    this.manifestHandler.write();
  }
};

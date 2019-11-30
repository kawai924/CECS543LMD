const { DB_PATH, MANIFEST_DIR, VSC_REPO_NAME, COMMANDS } = require("./");
const path = require("path");
const fs = require("fs");
const { makeDirSync, makeQueue, isDir } = require("./Functions");
const { ManifestWriter, ManifestReader } = require("./Manifest");
const { MasterManWriter, MasterManReader } = require("./Master");

class ProjectHandler {
  constructor(username) {
    this.username = username;
  }

  forProject(projectName) {
    this.projectName = projectName;
    this.projectPath = path.join(DB_PATH, this.username, projectName);
    this.repoPath = path.join(this.projectPath, VSC_REPO_NAME);
    this.manDirPath = path.join(this.repoPath, MANIFEST_DIR);
    return this;
  }

  create() {
    // Step 1: Create all neccessary folder
    fs.mkdirSync(path.join(this.repoPath, MANIFEST_DIR), { recursive: true });

    // Step 2: Get handlers
    const manWriter = new ManifestWriter(this.username, this.projectName);
    const masManWriter = new MasterManWriter(this.username, this.projectName);

    // Step 3: Build and write a manifest
    const newMan = manWriter
      .addCommand(COMMANDS.CREATE)
      .addStructure()
      .write();

    // Step 4: Add new manifest to master manifest
    masManWriter.writeFreshMasMan();
    masManWriter.addNewMan(newMan);
  }

  label(manID, label) {
    const masManWriter = new MasterManWriter(this.username, this.projectName);
    masManWriter.addLabel(manID, label);
  }

  checkin(projPath) {
    projPath = projPath || this.projectPath;

    // Step 2: Get handlers
    const manWriter = new ManifestWriter(this.username, this.projectName);
    const masManWriter = new MasterManWriter(this.username, this.projectName);
    const masManReader = new MasterManReader(this.username, this.projectName);

    // Step 3: Get artifacts
    const artifactsList = this._checkinProjectTree(projPath, this.repoPath);

    // Step 5: Get head
    const head = masManReader.getHead();

    // Step 4: Write manifest
    const newMan = manWriter
      .addCommand(COMMANDS.CHECKIN)
      .addParent(head)
      .addStructure(artifactsList)
      .write();

    // Step 5: Update master manifest
    masManWriter.addNewMan(newMan);
  }

  checkout(sUsername, sProjectName, sID) {
    // Step 1: Initialize all handlers
    const tManWriter = new ManifestWriter(this.username, this.projectName);
    const sManReader = new ManifestReader(sUsername, sProjectName);
    const tManReader = new ManifestReader(this.username, this.projectName);
    const tMasManWriter = new MasterManWriter(this.username, this.projectName);

    try {
      // Step 2: Attempt to get manifest
      const sMan = sManReader.getMan(sID);

      // Step 3: Create all neccessary folder
      fs.mkdirSync(this.manDirPath, { recursive: true });

      // Step 4: Checkout files
      const sProjectPath = path.join(DB_PATH, sUsername, sProjectName);
      const sArtifactList = sMan.structure || [];

      sArtifactList.forEach(artifact => {
        this._checkoutArtifact(artifact, sProjectPath);
        this._replicateOneArtifact(artifact, sProjectPath, this.repoPath);
      });

      // Step 5: Build and write a manifest
      const sPath = path.join(DB_PATH, sUsername, sProjectName);
      const newMan = tManWriter
        .addCommand(COMMANDS.CHECKOUT)
        .addCheckoutFrom(sPath)
        .addParent(sID)
        .addStructure(sMan.structure)
        .write();

      // Step 5: Add new manifest to master manifest
      tMasManWriter.addNewMan(newMan);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  remove() {
    fs.rmdirSync(this.projectPath, { recursive: true });
  }

  /** Private functions
   * ********************/
  _replicateOneArtifact(sArtifact, sProjectPath, tRepoPath) {
    //Create dirs
    const tADirRepoPath = path.join(tRepoPath, sArtifact.artifactRelPath);
    makeDirSync(tADirRepoPath, { recursive: true });

    if (sArtifact.artifactNode != "") {
      //Copy artifacts
      const tAartAbsRepoPath = path.join(tADirRepoPath, sArtifact.artifactNode);
      const sArtFileName = sArtifact.artifactNode.split(path.sep)[0];
      const tAartDirRepoPath = path.dirname(tAartAbsRepoPath);
      makeDirSync(tAartDirRepoPath, { recursive: true });

      const sArtAbsPath = path.join(
        sProjectPath,
        VSC_REPO_NAME,
        sArtifact.artifactRelPath,
        sArtifact.artifactNode
      );

      fs.copyFileSync(sArtAbsPath, tAartAbsRepoPath);
    }
  }

  _checkoutArtifact(artifact, sProjectPath) {
    if (artifact.artifactNode == "") {
      return;
    }
    const newDestPath = path.join(this.projectPath, artifact.artifactRelPath);
    fs.mkdirSync(newDestPath, { recursive: true }); // Recursively make folders in the destination

    // Get full file path from source
    const fileSource = path.join(
      sProjectPath,
      VSC_REPO_NAME,
      artifact.artifactRelPath,
      artifact.artifactNode
    );
    const fileName = artifact.artifactNode.split(path.sep)[0];

    fs.copyFileSync(fileSource, path.join(newDestPath, fileName));
  }

  // Duplicates two files into a given target directory
  // rPath = absolute path of repo path
  // gPath = absolute path of grandma path
  // targetPath = absolute path of intended target directory
  _mergeOutMoveFiles(rPath, gPath, targetPath) {
    let rPathDest = path.join(targetPath, path.basename(rPath));
    let gPathDest = path.join(targetPath, path.basename(gPath));
    let extensionR = path.extname(rPath);
    let extensionG = path.extname(gPath);

    // Duplicate rPath to targetPath
    fs.copyFile(rPath, rPathDest, err => {
      if (err) throw err;
      // console.log(path.basename(rPath), " copied to ", rPathDest);
    });

    // Duplicate gPath to targetPath
    fs.copyFile(gPath, gPathDest, err => {
      if (err) throw err;
      // console.log(path.basename(gPath), " copied to ", gPathDest);
    });

    // Append _mr or _mg to the duplicated filenames
    fs.renameSync(
      rPathDest,
      path.join(rPathDest.replace(/\.[^/.]+$/, "") + "_mr" + extensionR)
    );
    fs.renameSync(
      gPathDest,
      path.join(gPathDest.replace(/\.[^/.]+$/, "") + "_mg" + extensionG)
    );
  }

  /* This function reads each file from source folder, create artifact id and copy to target folder */
  _checkinProjectTree(projPath, toPath) {
    // console.log("(CF) projPath=" + projPath + "\n(CF) toPath=" + toPath);

    let struct = [];
    const repoPath = path.join(projPath, VSC_REPO_NAME);
    const _createArtifactID = this._createArtifactID; //_createArtifactID is not visible in _checkinProjectTreeRec

    (function _checkinProjectTreeRec(projPath, toPath) {
      const queue = makeQueue();

      const allFiles = fs.readdirSync(projPath);
      for (let file of allFiles) {
        queue.enqueue(file);
      }

      while (!queue.isEmpty()) {
        const file = queue.dequeue();
        if (!/^(?!\.).*$/.test(file)) continue; //Ignore DOT FILE (ex: .DS_STORE)

        // For Dir file
        if (isDir(projPath, file)) {
          const sourceFile = path.join(projPath, file);
          const targetFile = path.join(toPath, file);

          // Create dir at target
          makeDirSync(targetFile);

          struct.push({
            artifactNode: "",
            artifactRelPath: path.normalize(path.relative(repoPath, targetFile))
          });

          //Recursive call
          _checkinProjectTreeRec(sourceFile, targetFile);
        } else {
          // For FILE
          const leafFolder = path.join(toPath, file);

          // Create the folder there
          makeDirSync(leafFolder);

          const filePath = path.join(projPath, file);
          const aID = _createArtifactID(filePath);

          //Move the file with artifact name
          const aAbsPath = path.join(leafFolder, aID);
          fs.copyFileSync(filePath, aAbsPath);

          // Grab the absolute path from database to the curent artifact
          const aDirPath = path.parse(leafFolder).dir;

          // Add artifact and its path to manifest
          struct.push({
            artifactNode: path.join(file, aID),
            artifactRelPath: path.normalize(path.relative(repoPath, aDirPath))
          });
        }
      }
    })(projPath, toPath);

    return struct;
  }

  /* Read file content and return the artifactID */
  _createArtifactID(fileName) {
    // Read the file and grab the extension
    let data = fs.readFileSync(fileName, "utf8");
    let ext = fileName.substring(fileName.lastIndexOf("."));
    let weights = [1, 3, 7, 11, 13];
    const len = data.length;
    let weight;
    let sum = 0;

    // Creating the checksum using the ASCII numeric by multiplying character by the weights
    for (let i = 0; i < len; i++) {
      weight = i % weights.length;
      sum += data.charCodeAt(i) * weights[weight];
    }

    // Cap so the sum doesn't grow too large
    sum = sum % (Math.pow(2, 31) - 1);
    let artifactName = `${sum}-L${len}${ext}`;
    return artifactName;
  }
}

module.exports = {
  ProjectHandler
};

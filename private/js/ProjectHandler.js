const { DB_PATH, MANIFEST_DIR, VSC_REPO_NAME, COMMANDS } = require("./");
const path = require("path");
const fs = require("fs");
const { makeDirSync, makeQueue, isDir } = require("./Functions");
const { ManifestWriter, ManifestReader } = require("./Manifest");
const { MasterManWriter, MasterManReader } = require("./Master");

/**
 * Handling all actions for a project
 */
class ProjectHandler {
  constructor(username) {
    this.username = username;
  }

  /**
   * Add project name to the this instance
   * @param {String} projectName
   * @returns this instance
   */
  forProject(projectName) {
    this.projectName = projectName;
    this.projectPath = path.join(DB_PATH, this.username, projectName);
    this.repoPath = path.join(this.projectPath, VSC_REPO_NAME);
    this.manDirPath = path.join(this.repoPath, MANIFEST_DIR);
    return this;
  }

  /**
   * Create action
   * @returns void
   */
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

  /**
   * Label a manifest
   * @param {Number} manID manifest's ID
   * @param {String} label
   * @returns void
   */
  label(manID, label) {
    const masManWriter = new MasterManWriter(this.username, this.projectName);
    masManWriter.addLabel(manID, label);
  }

  /**
   * Check-in action
   * @param {String} projPath the path to the project
   * @returns void
   */
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

  /**
   * Check-out action
   * @param {String} sUsername from username
   * @param {String} sProjectName from project name
   * @param {Number} sID from manifest ID or label
   * @throws Error if master manifest doesn't exist
   * @returns void
   */
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

  /**
   * Remove a project of a user
   * @returns void
   */
  remove() {
    fs.rmdirSync(this.projectPath, { recursive: true });
  }

  /** Private functions
   * ********************/

  /**
   * Replicate one artifact file from source repo to target repo
   * @param {String} sArtifact source's artifact
   * @param {String} sProjectPath source's project path
   * @param {String} tRepoPath target's repo path
   */
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

  /**
   * During checkout, copy artifact from source's repo to current project tree
   * @param {JSON} artifact artifact object {artifactNode, artifactRelPath}
   * @param {String} sProjectPath source's project path
   * @returns void
   */
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

  /**
   * During merge out, move file from source's repo path and grandma's repo path to target project directory
   * @param {String} rPath source's repo path
   * @param {String} gPath grandma's repo path
   * @param {String} tPath target's repo path
   */
  _mergeOutMoveFiles(rPath, gPath, tPath) {

    // Parent directory of tPath
    let targetDirectory = path.dirname(tPath);

    // Set filenames to variables
    let rPathName = path.basename(path.dirname(rPath));
    let gPathName = path.basename(path.dirname(gPath));
    let tPathName = path.basename(path.dirname(tPath));

    // Set the destination absolute path
    let rPathDest = path.join(targetDirectory, path.basename(rPath));
    let gPathDest = path.join(targetDirectory, path.basename(gPath));
    let tPathDest = path.join(targetDirectory, path.basename(tPath));

    // Save file extensions for later
    let extensionR = path.extname(rPath);
    let extensionG = path.extname(gPath);
    let extensionT = path.extname(tPath);

    // Duplicate rPath to targetPath
    fs.copyFile(rPath, rPathDest, err => {
      if (err) throw err;
    });

    // Duplicate gPath to targetPath
    fs.copyFile(gPath, gPathDest, err => {
      if (err) throw err;
    });

    // Duplicate tPath within the same directory
    fs.copyFile(tPath, tPathDest, err => {
      if (err) throw err;
    });

    // Append _mr or _mg or _mt to the duplicated filenames
    fs.renameSync(
      rPathDest,
      path.join(targetDirectory, rPathName.replace(/\.[^/.]+$/, "") + "_mr" + extensionR)
    );
    fs.renameSync(
      gPathDest,
      path.join(targetDirectory, gPathName.replace(/\.[^/.]+$/, "") + "_mg" + extensionG)
    );
    fs.renameSync(
      tPathDest,
      path.join(targetDirectory, rPathName.replace(/\.[^/.]+$/, "") + "_mt" + extensionT)
    )
  }

  /**
   * For each file in project path, compute artifact ID, change filename to artifact ID and move it to the provided repo path
   * @param {*} projPath source project path that the files are evaluated.
   * @param {*} toPath the repo path where the artifact's parent directory and itself will be stored.
   * @returns void
   */
  _checkinProjectTree(projPath, toPath) {
    let struct = [];
    const repoPath = path.join(projPath, VSC_REPO_NAME);
    const _createArtifactID = this._createArtifactID; //_createArtifactID is not visible in _checkinProjectTreeRec

    (function _checkinProjectTreeRec(projPath, toPath) {
      const queue = makeQueue(); // create a new queue to store pending files/dirs

      // Add all files/dirs from project path to queue
      const allFiles = fs.readdirSync(projPath);
      for (let file of allFiles) {
        queue.enqueue(file);
      }

      while (!queue.isEmpty()) {
        const file = queue.dequeue();
        if (!/^(?!\.).*$/.test(file)) continue; //Ignore DOT FILE (ex: .DS_STORE)

        // For Dir
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
          // For file
          const leafFolder = path.join(toPath, file);

          // Create the folder there
          makeDirSync(leafFolder);

          const filePath = path.join(projPath, file);
          const aID = _createArtifactID(filePath); // compute artifact ID

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

  /**
   * Compute artifact ID from file's content
   * @param {String} filePath full path to file
   * @returns {Number} artifact ID of the file
   */
  _createArtifactID(filePath) {
    // Read the file and grab the extension
    let data = fs.readFileSync(filePath, "utf8");
    let ext = filePath.substring(filePath.lastIndexOf("."));
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

  /**
   * Find conflicts between two manifests. A conflict occurs when same file name with extension but different artifact ID at the same directory.
   * @param {JSON} mania first manifest JSON
   * @param {JSON} manib second manifest JSON
   * @returns {Array} an array of objects with the format {source : {artifactNode, artifactRelPath}, target: {artifactNode, artifactRelPath}}
   */
  _gatherConflicts(mania, manib) {
    const ssmallfilelist = [];
    const sfilelist = [];
    const sfolderlist = [];
    const sinfolder = [];
    let filename;

    for (let prop in mania.structure) {
      let structure = mania.structure[prop];
      sfilelist.push(mania.structure[prop]);
      filename = structure.artifactNode;
      ssmallfilelist.push(filename);
      sinfolder.push(structure.artifactRelPath) ;

      let tar = filename.lastIndexOf("/");
      let file = filename.substring(0, tar);
      sfolderlist.push(file);
    }

    const tsmallfilelist = [];
    const tfilelist = [];
    const tfolderlist = [];
    const tinfolder = [];

    for (let prop in manib.structure) {
      let structure = manib.structure[prop];
      tfilelist.push(manib.structure[prop]);
      filename = structure.artifactNode;
      tsmallfilelist.push(filename);
      tinfolder.push(structure.artifactRelPath) ;

      let tar = filename.lastIndexOf("/");
      let file = filename.substring(0, tar);
      tfolderlist.push(file);
    }

    let conflict = 0;
    let data = [];
    for (const [key, value] of Object.entries(sfolderlist)) {
      let tkey = tfolderlist.indexOf(value);

      if (
        tsmallfilelist[tkey] != ssmallfilelist[key] &&
        tinfolder[tkey] == sinfolder[key] &&
        key in ssmallfilelist &&
        tkey in tsmallfilelist
      ) {
        data.push({
          source: sfilelist[key],
          target: tfilelist[tkey]
        });

        conflict++;
      }
    }
    return data;
  }
}

module.exports = {
  ProjectHandler
};

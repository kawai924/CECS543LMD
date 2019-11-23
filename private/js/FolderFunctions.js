const fs = require("fs");
const path = require("path");

const Queue = require("./Queue");
const createArtifactId = require("./Artifact");

/* This function reads each file from source folder, create artifact id and copy to target folder */
function copyFolderTreeWithMemoization(fromPath, toPath) {
  // console.log("(CF) fromPath=" + fromPath + "\n(CF) toPath=" + toPath);

  let structure = [];
  const projectPath = fromPath;

  (function copyFolderTree(fromPath, toPath) {
    let fileQueue = new Queue();

    //Add all files to a queue
    const allFiles = fs.readdirSync(fromPath);
    for (let file of allFiles) {
      if (file !== "repo") {
        fileQueue.enqueue(file);
      }
    }

    //Process each element in the queue
    while (!fileQueue.isEmpty()) {
      const fileName = fileQueue.dequeue();

      //Check if fileName is a DOT FILE (ex: .DS_STORE), ignore
      if (!/^(?!\.).*$/.test(fileName)) continue;

      // The current file is a DIRECTORY
      if (isDirectory(fromPath, fileName)) {
        const dirPath = path.join(fromPath, fileName);
        const newTarget = path.join(toPath, fileName);

        // Create the directory in the destination
        makeDirSync(newTarget);

        // Add """" : dirPath to structure
        structure.push({
          artifactNode: "",
          artifactRelPath: relativePath(newTarget, projectPath)
        });

        //Recursively copy sub folders and files.
        copyFolderTree(dirPath, newTarget);
      } else {
        // The current file is a FILE
        // Grab the full path of leaf folder
        const leafFolder = path.join(toPath, fileName);

        // Create the folder there
        makeDirSync(leafFolder);

        //Create artifact for the file
        const filePath = path.join(fromPath, fileName);
        const artifact = createArtifactId(filePath);

        //Move the file with artifact name
        const artifactFullPath = path.join(leafFolder, artifact);
        fs.copyFile(filePath, artifactFullPath, err => {
          if (err) throw err;
        });

        // Grab the absolute path from database to the curent artifact
        const fileNameWithoutExtension = /.*(?=\.)/.exec(
          fileName.split("/").pop()
        )[0];
        const regrex = new RegExp(`.*(?=${fileNameWithoutExtension})`);
        const fullArtifactPath = regrex.exec(artifactFullPath)[0];

        // Add artifact and its path to manifest
        structure.push({
          artifactNode: path.join(fileName, artifact),
          artifactRelPath: relativePath(fullArtifactPath, projectPath)
        });
      }
    }
  })(fromPath, toPath);

  return structure;
}

/**
 * Check if a file from a source is a directory
 */
function isDirectory(source, fileName) {
  const filePath = path.join(source, fileName);
  return fs.statSync(filePath).isDirectory();
}

/* Function to create a directory if directory is not exists */
function makeDirSync(path, options = { recursive: true }) {
  !fs.existsSync(path) && fs.mkdirSync(path, options);
}

function relativePath(fullPath, commonPath) {
  return fullPath.split(commonPath)[1];
}

module.exports = {
  copyFolderTreeWithMemoization,
  isDirectory,
  makeDirSync
};

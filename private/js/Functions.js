const { fs, path } = require(".");

/* This function reads each file from source folder, create artifact id and copy to target folder */
function copyDirTree(fromPath, toPath) {
  // console.log("(CF) fromPath=" + fromPath + "\n(CF) toPath=" + toPath);

  let struct = [];
  const projectPath = fromPath;

  (function copyDirTreeRec(fromPath, toPath) {
    const queue = makeQueue();

    const allFiles = fs.readdirSync(fromPath);
    for (let file of allFiles) {
      queue.enqueue(file);
    }

    while (!queue.isEmpty()) {
      const file = queue.dequeue();

      //Ignore DOT FILE (ex: .DS_STORE)
      if (!/^(?!\.).*$/.test(file)) continue;

      // For Dir file
      if (isDir(fromPath, file)) {
        const sourceFile = path.join(fromPath, file);
        const targetFile = path.join(toPath, file);

        // Create dir at target
        makeDirSync(targetFile);

        struct.push({
          artifactNode: "",
          artifactRelPath: path.normalize(
            path.relative(projectPath, targetFile)
          )
        });

        //Recursive call
        copyDirTreeRec(sourceFile, targetFile);
      } else {
        // For FILE
        const leafFolder = path.join(toPath, file);

        // Create the folder there
        makeDirSync(leafFolder);

        const filePath = path.join(fromPath, file);
        const aID = createArtifactID(filePath);

        //Move the file with artifact name
        const aAbsPath = path.join(leafFolder, aID);
        fs.copyFileSync(filePath, aAbsPath);

        // Grab the absolute path from database to the curent artifact
        const aDirPath = path.parse(leafFolder).dir;

        // Add artifact and its path to manifest
        struct.push({
          artifactNode: path.join(file, aID),
          artifactRelPath: path.normalize(path.relative(projectPath, aDirPath))
        });
      }
    }
  })(fromPath, toPath);

  return struct;
}

/**
 * Check if a file from a source is a directory
 */
function isDir(source, fileName) {
  const filePath = path.join(source, fileName);
  return fs.statSync(filePath).isDirectory();
}

/* Function to create a directory if directory is not exists */
function makeDirSync(path, options = { recursive: true }) {
  !fs.existsSync(path) && fs.mkdirSync(path, options);
}

/* Read file content and return the artifactID */
function createArtifactID(fileName) {
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

function makeQueue() {
  let _data = [];

  const enqueue = element => {
    _data.unshift(element);
  };

  const dequeue = () => {
    return _data.shift();
  };

  const isEmpty = () => {
    return _data.length === 0;
  };

  const print = () => {
    console.log(_data);
  };

  return {
    enqueue,
    dequeue,
    isEmpty,
    print
  };
}

module.exports = {
  copyDirTree,
  isDir,
  makeDirSync
};

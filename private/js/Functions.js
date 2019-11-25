const {
  ROOTPATH,
  DATABASE_NAME,
  MASTER_MANIFEST_NAME,
  VSC_REPO_NAME,
  MANIFEST_DIR
} = require(".");
const fs = require("fs");
const path = require("path");

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

function numberOfConflict(mania, manib) {
  //mania = "/Users/dennislo/Desktop/git/school/CECS543LMD/database/dennis2/py2/manifests/manifest_3.json";
  var maniadata = require(mania);
  gsmallfilelist = [];
  gfolderlist = [];
  for (let prop in maniadata) {
    if (prop == "structure") {
      //console.log( maniadata[prop] );
      var structure = maniadata[prop];
      for (let x in structure) {
        //console.log(structure[x]);
        var file = structure[x];
        for (let y in file) {
          if (y == "artifactNode") {
            //console.log(file[y]);
            //var shortvalue = value.replace(gdir, "");
            gsmallfilelist.push(file[y]);
            var tar = file[y].lastIndexOf("/");
            var file = file[y].substring(0, tar);
            gfolderlist.push(file);
          }
        }
      }
    }
  }
  //manib = "/Users/dennislo/Desktop/git/school/CECS543LMD/database/dennis2/py2/manifests/manifest_1.json";
  var manibdata = require(manib);
  tsmallfilelist = [];
  tfolderlist = [];
  for (let prop in manibdata) {
    if (prop == "structure") {
      //console.log( maniadata[prop] );
      var structure = manibdata[prop];
      for (let x in structure) {
        //console.log(structure[x]);
        var file = structure[x];
        for (let y in file) {
          if (y == "artifactNode") {
            //console.log(file[y]);
            //var shortvalue = value.replace(gdir, "");
            tsmallfilelist.push(file[y]);
            var tar = file[y].lastIndexOf("/");
            var file = file[y].substring(0, tar);
            tfolderlist.push(file);
          }
        }
      }
    }
  }
  //console.log(gsmallfilelist, gfolderlist, tsmallfilelist, tfolderlist);

  var conflict = 0;
  var data = {};
  for (const [key, value] of Object.entries(gfolderlist)) {
    var tkey = tfolderlist.indexOf(value);

    if (tsmallfilelist[tkey] != gsmallfilelist[key]) {
      // console.log(key, value);
      // console.log(
      //   gsmallfilelist[key],
      //   tsmallfilelist[tkey]
      // );
      if (conflict == 0) {
        data = {
          gtarget: gsmallfilelist[key],
          ttarget: tsmallfilelist[tkey]
        };
      } else {
        data =
          data +
          "," +
          {
            gtarget: gsmallfilelist[key],
            ttarget: tsmallfilelist[tkey]
          };
      }

      conflict++;
    }
  }
  //console.log("total conflict: " + conflict);
  var json = [
    {
      keyconflict: conflict,
      keyconflictfile: data
    }
  ];
  //console.log(json);
  return json;
}

/* Gather information about repos in database of a user */
function buildRepoInfoList(repoList, userPath) {
  const repoInfoList = [];

  // Build an object containing information for each repo
  repoList.forEach(repo => {
    // Check if it is a directory
    if (fs.lstatSync(path.join(userPath, repo)).isDirectory()) {
      // Initialize
      const repoInfoEach = {
        name: repo,
        manifests: [],
        labels: [],
        filepath: []
      };
      const manifestFolderPath = path.join(
        userPath,
        repo,
        VSC_REPO_NAME,
        MANIFEST_DIR
      );

      // Grab list of manifests
      const manifestList = fs.readdirSync(manifestFolderPath);

      // Grab labels from master manifest
      repoInfoEach.labels = JSON.parse(
        fs.readFileSync(
          path.join(userPath, repo, VSC_REPO_NAME, MASTER_MANIFEST_NAME)
        )
      ).labels;

      // For each manifest, build an list of necessary information into an object
      // then push that object into repoInfoEach.manifests array
      manifestList.forEach(manifest => {
        const manifestObject = JSON.parse(
          fs.readFileSync(path.join(manifestFolderPath, manifest))
        );

        // let list = "";
        // for (i in manifestObject.structure) {
        //   let elem = manifestObject.structure[i];
        //   const elemarr = [];
        //   for (let key in elem) {
        //     elemarr.push(key);
        //   }
        //   let LIFO = elemarr.pop();
        //   list += elem[LIFO];
        //   LIFO = elemarr.pop();
        //   list += elem[LIFO] + "\n";
        // }

        let readdatetime = manifestObject.datetime
          .replace(/T/, " ")
          .replace(/\..+/, "");

        // repoInfoEach.manifests.push({
        //   name: manifest,
        //   command: manifestObject.command,
        //   datetime: readdatetime,
        //   // filepath: list,
        //   ID: manifestObject.id
        // });
        const { user, repo, structure, ...desiredManifest } = manifestObject;

        repoInfoEach.manifests.push({
          ...desiredManifest,
          name: manifest,
          datetime: readdatetime
        });
      });

      repoInfoList.push(repoInfoEach);
    }
  });
  return repoInfoList;
}

module.exports = {
  copyDirTree,
  isDir,
  makeDirSync,
  numberOfConflict,
  makeQueue,
  buildRepoInfoList
};

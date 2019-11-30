const { MASTER_MANIFEST_NAME, VSC_REPO_NAME, MANIFEST_DIR } = require(".");
const fs = require("fs");
const path = require("path");

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
  ssmallfilelist = [];
  sfilelist = [];
  sfolderlist = [];
  for (let prop in mania.structure) {
    var structure = mania.structure[prop];
    //console.log(mania.structure[prop]);
    sfilelist.push(mania.structure[prop]);
    filename = structure.artifactNode;
    ssmallfilelist.push(filename);
    var tar = filename.lastIndexOf("/");
    var file = filename.substring(0, tar);
    sfolderlist.push(file);
  }
  //console.log(ssmallfilelist, sfolderlist);

  //manib = target manifest json object;
  tsmallfilelist = [];
  tfilelist = [];
  tfolderlist = [];
  for (let prop in manib.structure) {
    var structure = manib.structure[prop];
    tfilelist.push(manib.structure[prop]);
    //console.log(structure.artifactNode, structure.artifactAbsPath);
    filename = structure.artifactNode;
    tsmallfilelist.push(filename);

    var tar = filename.lastIndexOf("/");
    var file = filename.substring(0, tar);
    tfolderlist.push(file);
  }
  //console.log(tsmallfilelist, tfolderlist);

  var conflict = 0;

  var data = [];
  for (const [key, value] of Object.entries(sfolderlist)) {
    var tkey = tfolderlist.indexOf(value);

    if (tsmallfilelist[tkey] != ssmallfilelist[key]  && key in ssmallfilelist && tkey in tsmallfilelist) {
      //console.log(sfilelist[key], tfilelist[tkey]);
      data.push({
        source: sfilelist[key],
        target: tfilelist[tkey]
      });

      conflict++;
    }
  }
  // console.log(data);
  var json = {
    conflict: conflict,
    conflictFiles: data
  };
  //console.log(data);
  //console.log(json);

  // return json;
  return data;
}

// /* Gather information about repos in database of a user */
// function buildRepoInfoList(repoList, userPath) {
//   const repoInfoList = [];

//   // Build an object containing information for each repo
//   repoList.forEach(repo => {
//     // Check if it is a directory
//     if (fs.lstatSync(path.join(userPath, repo)).isDirectory()) {
//       // Initialize
//       const repoInfoEach = {
//         name: repo,
//         manifests: [],
//         labels: [],
//         filepath: []
//       };
//       const manifestFolderPath = path.join(
//         userPath,
//         repo,
//         VSC_REPO_NAME,
//         MANIFEST_DIR
//       );

//       // Grab list of manifests
//       const manifestList = fs.readdirSync(manifestFolderPath);

//       // Grab labels from master manifest
//       repoInfoEach.labels = JSON.parse(
//         fs.readFileSync(
//           path.join(userPath, repo, VSC_REPO_NAME, MASTER_MANIFEST_NAME)
//         )
//       ).labels;

//       // For each manifest, build an list of necessary information into an object
//       // then push that object into repoInfoEach.manifests array
//       manifestList.forEach(manifest => {
//         const manifestObject = JSON.parse(
//           fs.readFileSync(path.join(manifestFolderPath, manifest))
//         );

//         // let list = "";
//         // for (i in manifestObject.structure) {
//         //   let elem = manifestObject.structure[i];
//         //   const elemarr = [];
//         //   for (let key in elem) {
//         //     elemarr.push(key);
//         //   }
//         //   let LIFO = elemarr.pop();
//         //   list += elem[LIFO];
//         //   LIFO = elemarr.pop();
//         //   list += elem[LIFO] + "\n";
//         // }

//         let readdatetime = manifestObject.datetime
//           .replace(/T/, " ")
//           .replace(/\..+/, "");

//         // repoInfoEach.manifests.push({
//         //   name: manifest,
//         //   command: manifestObject.command,
//         //   datetime: readdatetime,
//         //   // filepath: list,
//         //   ID: manifestObject.id
//         // });
//         const { user, repo, structure, ...desiredManifest } = manifestObject;

//         repoInfoEach.manifests.push({
//           ...desiredManifest,
//           name: manifest,
//           datetime: readdatetime
//         });
//       });

//       repoInfoList.push(repoInfoEach);
//     }
//   });
//   return repoInfoList;
// }

module.exports = {
  isDir,
  makeDirSync,
  numberOfConflict,
  makeQueue
};

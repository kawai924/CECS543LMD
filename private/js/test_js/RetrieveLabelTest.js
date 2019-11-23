const RepoHandler = require("./../RepoHandler");

const aliceRepoHandler = new RepoHandler(
  "Alice",
  "ProjectX",
  "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/database/Alice/ProjectX"
);

let result = aliceRepoHandler.getManifestObject(
  "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/database/Alice/ProjectX/.vcsx",
  "label_1"
);

console.log(result);

result = aliceRepoHandler.getManifestObject(
  "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/database/Alice/ProjectX/.vcsx",
  1574547462262
);

console.log(result);

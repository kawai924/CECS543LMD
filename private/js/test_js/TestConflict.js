const { numberOfConflict } = require("../Functions");
const manifest1 = {
  user: "Alice",
  repo: "ProjectX",
  structure: [
    { artifactNode: "data.txt/7590-L11.txt", artifactRelPath: ".vcsx" }
  ],
  parent: [1574636514339],
  command: "check-in",
  datetime: "2019-11-24T23:01:54.344Z",
  id: 1574636514344
};

console.log(numberOfConflict(manifest1, manifest1));

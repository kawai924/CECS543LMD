const PathHandler = require("./PathHandler");
const fs = require("fs-extra");

const alicePathHandler = PathHandler("Alice", "ProjectX");

console.log(alicePathHandler.getProjectPath());

// const fileObj = JSON.parse(fs.readFileSync(alicePathHandler.getInfoJSONPath()));

// const manifestList = fs.readdirSync(alicePathHandler.getManifestDirPath());

// console.log(manifestList);

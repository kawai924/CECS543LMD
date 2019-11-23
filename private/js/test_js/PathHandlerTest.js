const PathHandler = require("../PathHandler");
const fs = require("fs-extra");
const DBHandler = require("../DBHandler");
const alicePathHandler = PathHandler("Alice", "ProjectX");

// const fileObj = JSON.parse(fs.readFileSync(alicePathHandler.getInfoJSONPath()));

// const manifestList = fs.readdirSync(alicePathHandler.getManifestDirPath());

// console.log(manifestList);

console.log(DBHandler().getProjectPath("Alice", "ProjectX"));

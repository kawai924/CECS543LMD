const Manifest = require("../private/js/Manifest");
const path = require("path");
const constants = require("../server/constants");

const targetPath = path.join(constants.ROOTPATH, "database", "liam");

const mine = new Manifest("create repo", path.join(targetPath, "Test_user"));
mine.init();
mine.addToStructure("haha", "bb");
console.log(mine);

const express = require("express");
const DBHandler = require("./../../private/js/DBHandler");

const router = express.Router();

router.get("/", function(req, res, next) {
  return res.render("index", { users: DBHandler().getUsers() });
});

router.post("/", function(req, res) {
  const userName = req.body.username === "" ? "johndoe" : req.body.username;

  // Add user into users.json
  DBHandler().addUser(userName);

  res.redirect("/user/" + userName);
});

router.get("/test", function(req, res, next) {
  var json = numberOfConflict(
    "/Users/dennislo/Desktop/git/school/CECS543LMD/database/dennis2/py2/manifests/manifest_3.json",
    "/Users/dennislo/Desktop/git/school/CECS543LMD/database/dennis2/py2/manifests/manifest_1.json"
  );
  console.log(json);
});

module.exports = router;

// List all files in a directory in Node.js recursively in a synchronous fashion
//read the artifacts instead
// function walkSync(dir, filelist) {
//   var fs = fs || require("fs"),
//     files = fs.readdirSync(dir);
//   filelist = filelist || [];
//   files.forEach(function(file) {
//     if (fs.statSync(dir + "/" + file).isDirectory()) {
//       filelist = walkSync(dir + "/" + file, filelist);
//     } else {
//       filename = dir + "/" + file;
//       //filename.replace(dir, "")
//       filelist.push(filename);
//     }
//   });

//   return filelist;
// }

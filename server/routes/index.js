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

function numberOfConflict(mania, manib) {
  
  //mania = "/Users/dennislo/Desktop/git/school/CECS543LMD/database/dennis2/py2/manifests/manifest_3.json";
  var maniadata = require(mania);
  gsmallfilelist = [];
  gfolderlist = [];
  for( let prop in maniadata ){
    if(prop == 'structure'){
      //console.log( maniadata[prop] );
      var structure = maniadata[prop];
      for (let x in structure ){
        //console.log(structure[x]);
        var file = structure[x];
        for (let y in file ){
          if(y == 'artifactNode'){
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
  for( let prop in manibdata ){
    if(prop == 'structure'){
      //console.log( maniadata[prop] );
      var structure = manibdata[prop];
      for (let x in structure ){
        //console.log(structure[x]);
        var file = structure[x];
        for (let y in file ){
          if(y == 'artifactNode'){
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

    if (
      tsmallfilelist[tkey] != gsmallfilelist[key]
    ) {
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

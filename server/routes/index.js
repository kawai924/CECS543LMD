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
  var json = numberOfConflict("/Users/dennislo/Desktop/git/school/CECS543LMD/database/johndoe/Foo Friend","/Users/dennislo/Desktop/git/school/CECS543LMD/database/johndoe/Foo Enemy", "/Users/dennislo/Desktop/git/school/CECS543LMD/database/johndoe/Foo");
  console.log(json);
});

module.exports = router;

function numberOfConflict(gdir, rdir, tdir){

  //var gdir = "/Users/dennislo/Desktop/git/school/CECS543LMD/database/johndoe/Foo Friend";
  var filelist = walkSync(gdir);
  //before
  //console.log(filelist)
  //remove the first charater if all item has it
  gsmallfilelist = [];
  gfolderlist = [];
  filelist.forEach(function(value){
    var shortvalue = value.replace(gdir, "");
    gsmallfilelist.push(shortvalue);
    var tar = shortvalue.lastIndexOf("/");
    var file = shortvalue.substring(0,tar);
    gfolderlist.push(file);
  });
  //console.log(gsmallfilelist, gfolderlist);

  //var rdir = "/Users/dennislo/Desktop/git/school/CECS543LMD/database/johndoe/Foo Enemy";
  var filelist = walkSync(rdir);
  //before
  //console.log(filelist)
  //remove the first charater if all item has it
  rsmallfilelist = [];
  rfolderlist = [];

  filelist.forEach(function(value){
    var shortvalue = value.replace(rdir, "");
    rsmallfilelist.push(shortvalue);
    var tar = shortvalue.lastIndexOf("/");
    var file = shortvalue.substring(0,tar);
    rfolderlist.push(file);
  });
  //console.log(rsmallfilelist, rfolderlist);

  //var tdir = "/Users/dennislo/Desktop/git/school/CECS543LMD/database/johndoe/Foo";
  var filelist = walkSync(tdir);
  //before
  //console.log(filelist)
  //remove the first charater if all item has it
  tsmallfilelist = [];
  tfolderlist = [];
  filelist.forEach(function(value){
    var shortvalue = value.replace(tdir, "");
    tsmallfilelist.push(shortvalue);
    var tar = shortvalue.lastIndexOf("/");
    var file = shortvalue.substring(0,tar);
    tfolderlist.push(file);
  });
  //console.log(tsmallfilelist, tfolderlist);

  var conflict = 0;
  //var data = [];
  for (const [key, value] of Object.entries(gfolderlist)) {

    var rkey = rfolderlist.indexOf(value);
    var tkey = tfolderlist.indexOf(value);

    if (gsmallfilelist[key] != rsmallfilelist[rkey] || rsmallfilelist[key] != tsmallfilelist[rkey] || tsmallfilelist[key] != gsmallfilelist[rkey] ){
      console.log(key, value);
      console.log(gsmallfilelist[key], rsmallfilelist[rkey], tsmallfilelist[tkey]);
      if(conflict == 0){
        var data={
          "gtarget": gsmallfilelist[key],
          "rtarget": rsmallfilelist[rkey],
          "ttarget": tsmallfilelist[tkey]
        };
      }else{
        data= data+","+{
          "gtarget": gsmallfilelist[key],
          "rtarget": rsmallfilelist[rkey],
          "ttarget": tsmallfilelist[tkey]
        };
      }

      conflict++;
    }
  }
  console.log("total conflict: " + conflict);
  var json = [{ 
      "grandma": gdir,
      "repo": rdir,
      "target": tdir,
      "keyconflict": conflict,
      "keyconflictfile": data
  }];
  return json;
}


// List all files in a directory in Node.js recursively in a synchronous fashion
function walkSync(dir, filelist) {
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      filename = dir + '/' + file;
      //filename.replace(dir, "")
      filelist.push(filename);
    }
  });

  return filelist;
}
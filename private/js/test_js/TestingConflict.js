function numberOfConflict(mania, manib) {

  ssmallfilelist = [];
  sfolderlist = [];
  for( let prop in mania.structure ){
      var structure = mania.structure[prop];
      filename = structure.artifactNode;
      ssmallfilelist.push(filename);
      var tar = filename.lastIndexOf("/");
      var file = filename.substring(0, tar);
      sfolderlist.push(file);
  }
  console.log(ssmallfilelist, sfolderlist);
  
  //manib = target manifest json object;
  tsmallfilelist = [];
  tfolderlist = [];
  for( let prop in manib.structure ){
    var structure = manib.structure[prop];
    //console.log(structure.artifactNode, structure.artifactAbsPath);
    filename = structure.artifactNode;
    tsmallfilelist.push(filename);
    
    var tar = filename.lastIndexOf("/");
    var file = filename.substring(0, tar);
    tfolderlist.push(file);
    
  }
  console.log(tsmallfilelist, tfolderlist);

  var conflict = 0;
  
  var data = [];
  for (const [key, value] of Object.entries(sfolderlist)) {
    var tkey = tfolderlist.indexOf(value);

    if (
      tsmallfilelist[tkey] == ssmallfilelist[key]
    ) {
      data.push(
        {
          source: ssmallfilelist[key],
          target: tsmallfilelist[tkey]
        }
      );
      
      conflict++;
    }
  }
  var json = 
    {
      // source : sdir,
      // target: tdir, 
      keyconflict: conflict,
      keyconflictfile: data
    };
  //console.log(data);
  console.log(json);

  // return json;
}



const mani = {
  "user": "dennis2",
  "repo": "py2",
  "structure": [
    {
      "artifactNode": "multithread.py/414120-L7.py",
      "artifactAbsPath": "py2/"
    },
    { "artifactNode": "compare.py/671902-L1215.py", "artifactAbsPath": "py2/" }
  ],
  "command": "checkin",
  "id": 3,
  "datetime": "2019-11-07T23:08:56.408Z"
};

numberOfConflict(mani,mani);

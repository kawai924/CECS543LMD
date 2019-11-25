function numberOfConflict(mania, manib) {

  //mania = source manifest file;
  var maniadata = require(mania);
  ssmallfilelist = [];
  sfolderlist = [];
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
            ssmallfilelist.push(file[y]);
            var tar = file[y].lastIndexOf("/");
            var file = file[y].substring(0, tar);
            sfolderlist.push(file);

          }
        }
      }
    }
  }
  //manib = target manifest file;
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
  //console.log(ssmallfilelist, sfolderlist, tsmallfilelist, tfolderlist);

  var conflict = 0;
  
  var data = [];
  for (const [key, value] of Object.entries(sfolderlist)) {
    var tkey = tfolderlist.indexOf(value);

    if (
      tsmallfilelist[tkey] == ssmallfilelist[key]
    ) {
      //var data2 = ssmallfilelist[key] + tsmallfilelist[tkey];
      data.push(
        {
          source: ssmallfilelist[key],
          target: tsmallfilelist[tkey]
        }
      );
      // if (conflict == 0) {
      // } else {
      //   data2 = data2 + "," + ssmallfilelist[key] + tsmallfilelist[tkey];
      //   data = data + "," +
      //   {
      //     starget: ssmallfilelist[key],
      //     ttarget: tsmallfilelist[tkey]
      //   };
      // }
      conflict++;
    }
  }
  var json = [
    {
      keyconflict: conflict,
      keyconflictfile: data
    }
  ];
  console.log(data);
  console.log(json);
  // var obj = JSON.parse(json);
  // console.log (JSON.stringify(obj));

  //return json;
}

numberOfConflict("/Users/dennislo/Desktop/git/school/CECS543LMD/database/dennis2/py2/manifests/manifest_3.json", 
"/Users/dennislo/Desktop/git/school/CECS543LMD/database/dennis2/py2/manifests/manifest_3.json");

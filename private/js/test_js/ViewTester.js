const { View, ViewAll, ViewOneUser, ViewOneUserOneProj } = require("../View");

// const nSingleView = new ViewOneUserOneProj("alice", "ProjectX");
// result = JSON.stringify(nSingleView.execute());
// JSON.parse(result);
// console.log(JSON.stringify(nSingleView.execute()));

// const nViewAll = new ViewAll();
// nViewAll.execute();

// [
//     {
//         username : username,
//         project : projectName,
//         manifests : [
//             {
//                 blah blah blah
//             }
//         ]
//     }
// ]

const oSingleUser = new ViewOneUser("alice");
oSingleUser.execute();

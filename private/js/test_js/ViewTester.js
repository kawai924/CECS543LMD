const { View, ViewAll, ViewOneUser, ViewOneUserOneProj } = require("../View");

const nViewAll = new ViewAll().execute();
const nViewOne = new ViewOneUser("alice").execute();
const nViewOneOne = new ViewOneUserOneProj("alice", "alpha").execute();

// console.log(JSON.stringify(nViewAll));
// console.log(nViewOne);
// console.log(nViewOneOne);

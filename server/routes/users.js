const express = require("express");
const { buildRepoInfoList } = require("../../private/js/Functions");
const {
  fs,
  path,
  ROOTPATH,
  DATABASE_NAME,
  VSC_REPO_NAME
} = require("../../private/js/");

const router = express.Router();

router.get("/", function(req, res, next) {
  let users = fs.readdirSync(path.join(ROOTPATH, DATABASE_NAME));
  users = users.filter(user => user !== ".gitkeep" && user !== "users.json"); // filter out system files

  // Get all repos of a users
  let usersAndRepos = [];

  users.forEach(username => {
    let userRepos = [];
    const userDir = path.join(ROOTPATH, DATABASE_NAME, username);
    const repoList = fs.readdirSync(userDir) || [];

    usersAndRepos.push({
      username,
      repos: buildRepoInfoList(repoList, userDir)
    });
  });

  console.log(JSON.stringify(usersAndRepos[0].repos[0].manifests[0]));

  return res.render("users", { usersAndRepos });
});

module.exports = router;

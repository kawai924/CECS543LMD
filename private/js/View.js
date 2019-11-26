const { DB_PATH } = require("./index");
const { MasterManReader } = require("./Master");
const { ManifestReader } = require("./Manifest");
const path = require("path");
const fs = require("fs");

class ViewOneUserOneProj {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
  }

  execute() {
    const masManReader = new MasterManReader(this.username, this.projectName);
    const manReader = new ManifestReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();

    return {
      ...masMan,
      manifests: masMan.manifests.map(man =>
        manReader._getManByID(man.manifestID)
      )
    };
  }
}

class ViewOneUser {
  constructor(username) {
    this.username = username;
  }

  execute() {
    const userPath = path.join(DB_PATH, this.username);
    const projects = fs.readdirSync(userPath);

    let projsWithMans = [];
    projects.map(proj => {
      projsWithMans.push(new ViewOneUserOneProj(this.username, proj).execute());
    });

    return {
      user: this.username,
      projects: projsWithMans
    };
  }
}

class ViewAll {
  constructor() {}

  execute() {
    const dbPath = DB_PATH;
    const users = fs
      .readdirSync(dbPath)
      .filter(filename => /^(?!\.).*$/.test(filename)); //ignore DOT FILES

    return users.map(user => {
      const projects = new ViewOneUser(user).execute();
      return {
        user,
        projects
      };
    });
  }
}

module.exports = {
  ViewAll,
  ViewOneUserOneProj,
  ViewOneUser
};

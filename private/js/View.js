const { DB_PATH } = require("./index");
const { MasterManReader } = require("./Master");
const { ManifestReader } = require("./Manifest");
const path = require("path");
const fs = require("fs");

/**
 * Getting information of a user of a project
 */
class ViewOneUserOneProj {
  constructor(username, projectName) {
    this.username = username;
    this.projectName = projectName;
  }

  /**
   * Read master manifest and manifest to get informations about the project
   * @returns {JSON} information about the project.
   * @throws {Error} if manifest or master manifest cannot be found.
   */
  execute() {
    const masManReader = new MasterManReader(this.username, this.projectName);
    const manReader = new ManifestReader(this.username, this.projectName);
    const masMan = masManReader.getMasMan();

    if (masMan.manifests) {
      return {
        ...masMan,
        manifests: masMan.manifests.map(man =>
          manReader._getManByID(man.manifestID)
        )
      };
    } else {
      throw new Error(
        `Error at project ${this.projectName} from ${this.username}. Please delete the project manually to continue.`
      );
    }
  }
}

/**
 * Getting information of all projects of a user
 */
class ViewOneUser {
  constructor(username) {
    this.username = username;
  }

  /**
   * Read master manifest and manifest to get informations about all projects of a user
   * @returns {JSON} information about all projects of a user
   * @throws {Error} if manifest or master manifest cannot be found.
   */
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

/**
 * Getting information of all users
 */
class ViewAll {
  constructor() {}

  /**
   * Read master manifest and manifest to get informations about all projects of all users
   * @returns {JSON} information about all projects of all users
   * @throws {Error} if manifest or master manifest cannot be found.
   */
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

const path = require("path");
const { ROOTPATH, COMMANDS } = require("./../../constants");
const PathHandler = require("./PathHandler");
const DBHandler = require("./DBHandler");
const RepoHandler = require("./RepoHandler");

let manifestID;
const test_create = "create project_name project_path";
const test_checkin = "check-in project_name";
const test_checkout =
  "check-out | <target_path> | <from_username> | <from_repoName> | <from manifest id> OR <label name";
const test_merge_out =
  "merge-out project_name target_manifest_id source_path source_manifest_id";
const test_merge_in = "merge-in merge_out_manifest_id";

module.exports = function() {
  const commandParse = (prompt, { username }) => {
    const command = prompt.split(" ")[0];
    let args, projectName, currProjectPath;

    switch (command) {
      case COMMANDS.CREATE:
        args = splitAndAppend(prompt, " ", getNumberArgs(command) - 1);
        projectName = args[1];
        currProjectPath = args[2];

        new RepoHandler(username, projectName, currProjectPath).create();
        break;

      case COMMANDS.CHECKIN:
        args = splitAndAppend(prompt, " ", getNumberArgs(command) - 1);
        projectName = args[1];

        new RepoHandler(
          username,
          projectName,
          DBHandler().getProjectPath(username, projectName)
        ).checkin();
        break;

      case COMMANDS.CHECKOUT:
        args = splitAndAppend(prompt, " ", getNumberArgs(command) - 1);
        const target_path = args[4];
        const from_username = args[1];
        const from_repoName = args[2];
        const sourceManifestID = args[3];
        const targetProjectPath = path.join(target_path, from_repoName);

        // console.log({
        //   username,
        //   from_username,
        //   from_repoName,
        //   sourceManifestID,
        //   target_path,
        //   targetProjectPath
        // });

        new RepoHandler(username, from_repoName, targetProjectPath).checkout(
          from_username,
          from_repoName,
          sourceManifestID
        );
        break;

      default:
        throw new Error("Invalid commands");
    }
  };

  /** Helper functions
   * *****************/
  const getNumberArgs = (command, numberArgs) => {
    switch (command) {
      case COMMANDS.CREATE:
        return 3;
        break;
      case COMMANDS.CHECKIN:
        return 2;
        break;
      case COMMANDS.CHECKOUT:
        return 5;
        break;
    }
  };

  const splitAndAppend = (str, delim, count) => {
    const arr = str.split(delim);
    return [...arr.splice(0, count), arr.join(delim)];
  };

  return {
    commandParse
  };
};

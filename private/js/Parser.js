const { path, COMMANDS } = require("./");
const DBHandler = require("./DBHandler");
const RepoHandler = require("./RepoHandler");

module.exports = function() {
  let _command_guides = {
    [COMMANDS.CREATE]: "create | <project name> | <target folder>",
    [COMMANDS.CHECKIN]: "check-in | <project name>",
    [COMMANDS.CHECKOUT]:
      "check-out | <target_path> | <from_username> | <from_repoName> | <from manifest id> OR <label name",
    [COMMANDS.MERGE_OUT]:
      "merge-out | <project name> | <target manifest id> | <source username> | <souce manifest id>",
    [COMMANDS.MERGE_IN]: "merge-in | <project name>"
  };

  const commandParse = (prompt, { username }) => {
    const command = prompt.split(" ")[0];
    let args, projectName, targetFolder;

    switch (command) {
      case COMMANDS.CREATE:
        args = splitAndAppend(prompt, " ", getNumberArgs(command) - 1);
        projectName = args[1];
        targetFolder = args[2];
        const currProjectPath = path.join(targetFolder, projectName);
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

        new RepoHandler(username, from_repoName, targetProjectPath).checkout(
          from_username,
          from_repoName,
          sourceManifestID
        );
        break;

      default:
        throw new Error("Unable to parse command");
    }
  };

  /** Helper functions
   * *****************/
  const getNumberArgs = command => {
    switch (command) {
      case COMMANDS.CREATE:
        return getArgsCount(_command_guides[COMMANDS.CREATE]);
      case COMMANDS.CHECKIN:
        return getArgsCount(_command_guides[COMMANDS.CHECKIN]);
      case COMMANDS.CHECKOUT:
        return getArgsCount(_command_guides[COMMANDS.CHECKOUT]);
      case COMMANDS.MERGE_OUT:
        return getArgsCount(_command_guides[COMMANDS.MERGE_OUT]);
      case COMMANDS.MERGE_IN:
        return getArgsCount(_command_guides[COMMANDS.MERGE_IN]);
      default:
        throw new Error("Can't get args count of the command");
    }
  };

  const getArgsCount = str => {
    return str.split("|").length;
  };

  const splitAndAppend = (str, delim, count) => {
    const arr = str.split(delim);
    return [...arr.splice(0, count), arr.join(delim)];
  };

  return {
    commandParse
  };
};

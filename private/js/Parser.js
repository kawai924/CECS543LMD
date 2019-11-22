const RepoHandlerTest = require("./RepoHandlerTest");
const { ROOTPATH, COMMANDS } = require("./../../constants");
const path = require("path");

let manifestID;

const test_create = "username create project_name";
const test_checkin = "username check-in project_name";
const test_checkout =
  "username check-out project_name source_path source_manifestID";
const test_merge_out =
  "username merge-out project_name target_manifest_id source_path source_manifest_id";
const test_merge_in = "username merge-in merge_out_manifest_id";

function parser(prompt) {
  const argsArr = prompt.split(" ");

  const username = argsArr[0].toLowerCase();
  const inputCommand = argsArr[1].toLowerCase();
  const projectName = argsArr[2].toLowerCase();

  // Check whether enough arguments are supplied
  if (!validNumberArgs(inputCommand, argsArr.length)) {
    throw new Error("Not enough arguments");
  }

  switch (inputCommand) {
    case "create":
      new RepoHandlerTest(
        username,
        projectName,
        path.join(ROOTPATH, username, projectName)
      ).create();
      break;
    case "check-in":
      new RepoHandlerTest(
        username,
        projectName,
        path.join(ROOTPATH, username, projectName)
      ).checkin();
      break;
    case "check-out":
      new RepoHandlerTest(
        username,
        projectName,
        path.join(ROOTPATH, username, projectName)
      ).checkout(argsArr[3], argsArr[4]);
      break;
    // case "merge-out":
    //   new RepoHandler(username, projectName, path.join(ROOTPATH, username, projectName)).mergeOut(argsArr[3], argsArr[4], argsArr[5]);
    //   break;
    // case "merge-in":
    //   new RepoHandler(username, projectName, path.join(ROOTPATH, username, projectName)).mergeIn(argsArr[2]);
    //   break;
    default:
      throw new Error("Invalid commands");
  }
}

parser(test_create);
parser(test_checkin);
parser(test_checkout);
// parser(test_merge_out);
// parser(test_merge_in);

/** Helper functions
 * *****************/
function mapCommand(commandStr) {}

function validNumberArgs(command, numberArgs) {
  return numberArgs === getNumberArgs(command);
}

function getNumberArgs(command) {
  const numArgsPerCommandDict = {
    [COMMANDS.CREATE]: 3,
    [COMMANDS.CHECKIN]: 3,
    [COMMANDS.CHECKOUT]: 5,
    [COMMANDS.MERGE_OUT]: 6,
    [COMMANDS.MERGE_IN]: 3
  };

  return numArgsPerCommandDict[command];
}

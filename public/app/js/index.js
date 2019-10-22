//function to call node js function from JS using url request
const url = "/dirlist";
// on page load

const getdir = async url => {
  try {
    const response = await fetch(url);
    const text = await response.text().then(text => (result = text));
  } catch (error) {
    console.log("getDir has problem\n", error);
  }

  const dirlist = document.getElementById("dirlist");
  dirlist.innerHTML = result;
};

// Get list of folders in database
getdir(url);

function createRepo() {
  const textInput = document.getElementById("create-repo");
  // setTimeout(function() {
  //   textInput.value = "";
  // }, 500);
  const repoCreated = document.getElementById("repo-created");
  repoCreated.innerHTML = "<h1>Repository Created</h1>";
  // setTimeout(function() {
  //   getdir(url);
  // }, 500);
  getdir(url);
}

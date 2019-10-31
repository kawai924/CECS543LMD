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
  setTimeout(function() {
    repoCreated.style.visibility = "hidden";
  }, 1000);
  getdir(url);
}

$(document).ready(function(){

  console.log("ready")

  $("input[name='create-repo-options").change(function() {
    $("#version").prop('disabled', true);
    $("#target-folder").prop('disabled', true);
    console.log("Works")
  })

  $("input[name='check-in-options").change(function() {
    $("#version").prop('disabled', true);
    $("#target-folder").prop('disabled', true);
    console.log("Works")
  })

  $("input[name='check-out-options").change(function() {
    $("#version").prop('disabled', false);
    $("#target-folder").prop('disabled', false);
    console.log("Works")
  })
});

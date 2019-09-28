
function createRepo() {
    console.log("button works");
    const textInput = document.getElementById('create-repo');
    console.log(textInput.value);
    setTimeout(function() {
        textInput.value = '';
    }, 3000);
    const repoCreated = document.getElementById('repo-created');
    repoCreated.innerHTML = '<h1>Repository Created</h1>';

}



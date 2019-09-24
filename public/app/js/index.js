// // Code to use CLI
// const textInput = document.querySelector('#create-repo');
// const submit = document.querySelector('#create-repo-button');


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


// function submitCode(e) { 
//     console.log("Creating repo for:" , textInput.value);
    
// }

// submit.addEventListener('click', submitCode);


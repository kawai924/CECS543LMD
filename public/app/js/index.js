
//function to call node js function from JS using url request

const url = '/test';
const getdir = async url => {
    try {
        const response = await fetch(url);
        const text = await response.text().then(function(text){
                        result = text;
                    });;
        //console.log(result);
    } catch (error) {
        console.log(error);
    }
    const dirlist = document.getElementById('dirlist');
    dirlist.innerHTML = result;
}

// on page load
getdir(url);

function createRepo() {
    const textInput = document.getElementById('create-repo');
    setTimeout(function() {
        textInput.value = '';
    }, 500);
    const repoCreated = document.getElementById('repo-created');
    repoCreated.innerHTML = '<h1>Repository Created</h1>';
    setTimeout(function() {
        getdir(url);
    }, 500);
}
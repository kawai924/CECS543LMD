
function JStoNode() {
    var myFetch = fetch('./test');
    myFetch.then(function(response) {
        response.text().then(function(text){
            alert (text);

        });

    });

}
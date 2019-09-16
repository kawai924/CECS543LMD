var fs = require('fs');
let testFile = 'helloworld.txt';

module.exports = createArtifactId;

function createArtifactId(fileName) {
    return new Promise( (resolve, reject) => {
        fs.readFile(fileName, 'utf8', function(error, data) {
        // TODO Get extension of file? 
        // TODO turn into async function
            if (!error) {
                // let weights = [1,7,3,7,11];
                let weights = [1,3,7,11,13];
                const len = data.length;
                let weight;
                let sum = 0;
                for (let i = 0; i < len; i++) {
                    weight = i % weights.length;
                    sum += (data.charCodeAt(i) * weights[weight]);
                }
                let artifactName = `${sum}-L${len}.txt`;
                resolve(artifactName);
            } else {
                reject("Error in creating artifact name");
            }
        });
    });
}


// let testExample = createArtifactId(testFile).then( (value) => console.log(value));

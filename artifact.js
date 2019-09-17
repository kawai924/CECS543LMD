var fs = require('fs');

module.exports = createArtifactId;

// function createArtifactId(fileName) {
//     return new Promise( (resolve, reject) => {
//         fs.readFileSync(fileName, 'utf8', function(error, data) {
//             if (!error) {
//                 let ext = fileName.substring(fileName.indexOf('.'));
//                 // let weights = [1,7,3,7,11]; 
//                 let weights = [1,3,7,11,13];
//                 const len = data.length;
//                 let weight;
//                 let sum = 0;
//                 for (let i = 0; i < len; i++) {
//                     weight = i % weights.length;
//                     sum += (data.charCodeAt(i) * weights[weight]);
//                 }
//                 sum = sum % (Math.pow(2, 31) - 1);
//                 let artifactName = `${sum}-L${len}${ext}`;
//                 resolve(artifactName);
//             } else {
//                 reject("Error in creating artifact name");
//             }
//         });
//     });
// }



function createArtifactId(fileName) {
    let data = fs.readFileSync(fileName, 'utf8') 
    let ext = fileName.substring(fileName.indexOf('.'));
    // let weights = [1,7,3,7,11]; 
    let weights = [1,3,7,11,13];
    const len = data.length;
    let weight;
    let sum = 0;
    for (let i = 0; i < len; i++) {
        weight = i % weights.length;
        sum += (data.charCodeAt(i) * weights[weight]);
    }
    sum = sum % (Math.pow(2, 31) - 1);
    let artifactName = `${sum}-L${len}${ext}`;
    return artifactName;
}

console.log(createArtifactId('helloworld.txt'));
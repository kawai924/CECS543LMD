/**
 * This function to generate an artifact ID from the content of a file.
 */
var fs = require('fs');

module.exports = createArtifactId;

/**
 * Read the file and return the artifactID name
 * @param fileName name of the file we will generate the artifactID for
 */
function createArtifactId(fileName) {
    
    // Read the file and grab the extension
    let data = fs.readFileSync(fileName, 'utf8'); 
    let ext = fileName.substring(fileName.indexOf('.'));
    let weights = [1,3,7,11,13];
    const len = data.length;
    let weight;
    let sum = 0;

    // Loop through the text. Creating the checksum using the ASCII numeric 
    // character multiplied by the weights
    for (let i = 0; i < len; i++) {
        weight = i % weights.length;
        sum += (data.charCodeAt(i) * weights[weight]);
    }
    // Cap so the sum doesn't grow too large
    sum = sum % (Math.pow(2, 31) - 1);
    let artifactName = `${sum}-L${len}${ext}`;
    return artifactName;
}

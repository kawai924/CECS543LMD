var fs = require('fs');

/* Read file content and return the artifactID */
function createArtifactId(fileName) {
  // Read the file and grab the extension
  let data = fs.readFileSync(fileName, 'utf8');
  let ext = fileName.substring(fileName.lastIndexOf('.'));
  console.log('Ext = ' + ext);
  let weights = [1, 3, 7, 11, 13];
  const len = data.length;
  let weight;
  let sum = 0;

  // Creating the checksum using the ASCII numeric by multiplying character by the weights
  for (let i = 0; i < len; i++) {
    weight = i % weights.length;
    sum += data.charCodeAt(i) * weights[weight];
  }

  // Cap so the sum doesn't grow too large
  sum = sum % (Math.pow(2, 31) - 1);
  let artifactName = `${sum}-L${len}${ext}`;
  return artifactName;
}

module.exports = createArtifactId;

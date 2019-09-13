var fs = require('fs');
let fileName = 'helloworld.txt';



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
        console.log(`${sum}-L${len}.txt`);
    }
});
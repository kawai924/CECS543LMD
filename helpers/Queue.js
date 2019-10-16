/**
 * This class creates and maintain a queue.
 */

class Queue {
    constructor() {this.data = [];}
    enqueue(element) {this.data.unshift(element);}
    dequeue() {return this.data.shift();}
    isEmpty() {return this.data.length === 0;}
    print() {console.log(this.data);}
}


module.exports = {Queue};
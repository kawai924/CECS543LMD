module.exports = class Queue {
  constructor() {
    this.data = [];
  }
  enqueue(element) {
    this.data.unshift(element);
  }
  dequeue() {
    return this.data.shift();
  }
  isEmpty() {
    return this.data.length === 0;
  }
  print() {
    console.log(this.data);
  }
};

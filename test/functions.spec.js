const mockFS = require("mock-fs");
const { isDir, copyDirTree, makeQueue } = require("../private/js/Functions");
const assert = require("chai").assert;
const fs = require("fs");

describe("Functions", function() {
  describe("Queue", function() {
    it("should follow FIFO", function() {
      const queue = makeQueue();
      queue.enqueue(2);
      queue.enqueue(3);
      assert.equal(queue.dequeue(), 3);
      assert.equal(queue.dequeue(), 2);
      assert.isTrue(queue.isEmpty());
    });
  });

  describe("File System", function() {
    beforeEach(() => {
      mockFS({
        source: {
          "file.txt": "",
          folder1: {},
          folder2: {
            "nested.txt": ""
          }
        },
        target: {}
      });
    });

    describe("#isDir()", function() {
      it("returns true for folder", function() {
        assert.isTrue(isDir("", "source"));
      });

      it("return false for file", function() {
        assert.isFalse(isDir("source", "file.txt"));
      });
    });
  });
});

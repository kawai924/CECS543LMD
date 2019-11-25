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

    describe("#copyDirTree()", function() {
      it("copy all folders and create artifacts from source to target", function() {
        copyDirTree("source", "target");
        const atSource = ["file.txt", "folder1", "folder2"];
        const atFolder2 = ["nested.txt"];
        const atNested = ["0-L0.txt"];
        const atFile = ["0-L0.txt"];

        assert.sameMembers(fs.readdirSync("target"), atSource);
        assert.sameMembers(fs.readdirSync("target/folder2"), atFolder2);
        assert.sameMembers(
          fs.readdirSync("target/folder2/nested.txt"),
          atNested
        );
        assert.sameMembers(fs.readdirSync("target/file.txt"), atFile);
      });

      it("should return a array", function() {
        assert.isArray(copyDirTree("source", "target"));
      });
    });

    afterEach(() => {
      mockFS.restore();
    });
  });
});

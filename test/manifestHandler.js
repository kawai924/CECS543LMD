const { manifestWriter } = require("../private/js/Handlers");
const { DB_PATH } = require("../private/js");
const assert = require("chai").assert;
const path = require("path");
const mockFS = require("mock-fs");
const fs = require("fs");

describe("Manifest Handlers", function() {
  describe("Manifest Reader", function() {});

  describe("Manifest Writer", function() {
    beforeEach(() => {
      mockFS({
        source: {}
      });
    });
    afterEach(() => {
      mockFS.restore();
    });

    it("should initialize with username, project name", function() {
      const manWriter = new manifestWriter("a", "b");
      const repoPath = path.join(DB_PATH, "a", "b");

      assert.equal(manWriter.username, username);
      assert.equal(manWriter.projectName, projectName);
      assert.equal(manWriter.rPath, repoPath);
    });

    it("should write a correct json", function() {
      const output = new manifestWriter("a", "b")
        .addCheckoutFrom("c")
        .addCommand("d")
        .addParent("e")
        .addStructure("f")
        .write(
          "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/test"
        );

      //   const expected = {
      //     user: "a",
      //     project: "b",
      //     structure: "c",
      //     parent: "d",
      //     command: "e",
      //     datetime: new Date(),
      //     id: new Date().getTime()
      //   };
      fs.rmdirSync(
        "/Users/chinhnguyen/Dropbox/School/CSULB/Master/Fall 2019/543/Project 1/Project/CECS543LMD/test/a",
        { recursive: true }
      );
      assert.equal(output, "user");
      assert.equal(output, "project");
      assert.equal(output, "structure");
      assert.equal(output, "parent");
      assert.equal(output, "command");
      assert.equal(output, "datetime");
      assert.equal(output, "id");
    });
  });
});

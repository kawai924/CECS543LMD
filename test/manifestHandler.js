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

      assert.equal(manWriter.username, "a");
      assert.equal(manWriter.projectName, "b");
      assert.equal(manWriter.rPath, repoPath);
    });
  });
});

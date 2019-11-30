const mockFS = require("mock-fs");
const fs = require("fs");
const assert = require("chai").assert;
const { ProjectHandler } = require("../private/js/ProjectHandler");

describe("Merge", function() {
  describe("#_mergeOutMoveFiles()", function() {
    beforeEach(() => {
      mockFS({
        "source/data.txt/": { "S111-S00.txt": "" },
        "grandma/data.txt": { "G111-G00.txt": "" },
        target: { "data.txt": "" }
      });

      projHandler = new ProjectHandler("johndoe", "sample");
    });

    afterEach(() => {
      mockFS.restore();
    });

    it("target folder should have 3 files.", function() {
      projHandler._mergeOutMoveFiles(
        "source/data.txt/S111-S00.txt",
        "grandma/data.txt/G111-G00.txt",
        "target"
      );

      assert.equal(fs.readdirSync("target").length, 3);
    });

    it("target folder should have 3 filenames with _mt, _mr, _mg.", function() {
      projHandler._mergeOutMoveFiles(
        "source/data.txt/S111-S00.txt",
        "grandma/data.txt/G111-G00.txt",
        "target"
      );

      assert.deepEqual(fs.readdirSync("target"), [
        "data_mr.txt",
        "data_mg.txt",
        "data_mt.txt"
      ]);
    });
  });

  describe("#conflictArtifacts()", function() {
    beforeEach(() => {
      man1 = {
        user: "Alice",
        repo: "ProjectX",
        structure: [
          { artifactNode: "data.txt/7590-L11.txt", artifactRelPath: "" },
          { artifactNode: "string.txt/6464-A22.txt", artifactRelPath: "" },
          {
            artifactNode: "document.txt/9999-A00.txt",
            artifactRelPath: ""
          },
          {
            artifactNode: "pdf.txt/7424-B12.txt",
            artifactRelPath: ""
          }
        ],
        parent: [1574636514339],
        command: "check-in",
        datetime: "2019-11-24T23:01:54.344Z",
        id: 1574636514344
      };

      man2 = {
        user: "Bob",
        repo: "ProjectX",
        structure: [
          { artifactNode: "data.txt/7590-L11.txt", artifactRelPath: "" },
          {
            artifactNode: "string.txt/9999-A00.txt",
            artifactRelPath: ""
          },
          { artifactNode: "json.txt/9999-A00.txt", artifactRelPath: "" },
          { artifactNode: "html.txt/3333-A55.txt", artifactRelPath: "" }
        ],
        parent: [1574636514339],
        command: "check-in",
        datetime: "2019-11-24T23:01:54.344Z",
        id: 1574636514344
      };
    });

    it("same manifest should result in 0 conflict", function() {
      assert.equal(projHandler._gatherConflicts(man1, man1).length, 0);
    });

    it("should result in right number of conflict between two manifests", function() {
      assert.equal(projHandler._gatherConflicts(man1, man2).length, 1);
    });

    it("should return an array", function() {
      assert.typeOf(projHandler._gatherConflicts(man1, man2), "array");
    });

    it("should return correct answer", function() {
      const result = [
        {
          source: {
            artifactNode: "string.txt/6464-A22.txt",
            artifactRelPath: ""
          },
          target: {
            artifactNode: "string.txt/9999-A00.txt",
            artifactRelPath: ""
          }
        }
      ];
      assert.deepEqual(projHandler._gatherConflicts(man1, man2), result);
    });
  });
});

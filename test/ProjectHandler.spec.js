const mockFS = require("mock-fs");
const fs = require("fs");
const assert = require("chai").assert;
const { numberOfConflict } = require("../private/js/Functions");
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

      assert.equal(fs.readdirSync("target"), [
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
            artifactRelPath: ".vcsx"
          },
          {
            artifactNode: "pdf.txt/7424-B12.txt",
            artifactRelPath: ".vcsx"
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
            artifactRelPath: ".vcsx"
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

    it("same manifest should result in conflict equal to number of element", function() {
      assert.equal(numberOfConflict(man1, man1).length, man1.structure.length);
    });

    it("should result in 1 conflict between two manifests", function() {
      assert.equal(numberOfConflict(man1, man2).length, 1);
    });

    it("should return expected format. Assuming 1st param = source, 2nd param = target", function() {
      const result = [
        {
          source: {
            artifactNode: "string.txt/6464-A22.txt",
            artifactRelPath: ".vcsx"
          },
          target: {
            artifactNode: "string.txt/9999-A00.txt",
            artifactRelPath: ".vcsx"
          }
        }
      ];
      assert.equal(numberOfConflict(man1, man2), result);
    });
  });
});

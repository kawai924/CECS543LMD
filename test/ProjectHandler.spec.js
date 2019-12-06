/*
 * Test some functions of ProjectHandler.js
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const mockFS = require('mock-fs');
const fs = require('fs');
const assert = require('chai').assert;
const expect = require('chai').expect;

const { ProjectHandler } = require('../private/js/ProjectHandler');

describe('ProjectHandler', function() {
  describe('Merging', function() {
    describe('#_mergeOutMoveFile()', function() {
      beforeEach(() => {
        mockFS({
          'source/data.txt/': { 'S111-S00.txt': '' },
          'grandma/data.txt': { 'G111-G00.txt': '' },
          target: { 'data.txt': '' }
        });

        projHandler = new ProjectHandler('johndoe', 'sample');
      });

      afterEach(() => {
        mockFS.restore();
      });

      it('target folder should have 3 files.', function() {
        projHandler._mergeOutMoveFile(
          'source/data.txt/S111-S00.txt',
          'grandma/data.txt/G111-G00.txt',
          'target/data.txt'
        );

        expect(fs.readdirSync('target').length).to.be.equal(3);
      });

      it('target folder should have 3 filenames with _mt, _mr, _mg.', function() {
        projHandler._mergeOutMoveFile(
          'source/data.txt/S111-S00.txt',
          'grandma/data.txt/G111-G00.txt',
          'target/data.txt'
        );

        expect(fs.readdirSync('target')).to.have.members([
          'data_mr.txt',
          'data_mg.txt',
          'data_mt.txt'
        ]);
      });
    });

    describe('#_gatherConflicts()', function() {
      beforeEach(() => {
        man1 = {
          user: 'Alice',
          repo: 'ProjectX',
          structure: [
            { artifactNode: 'data.txt/7590-L11.txt', artifactRelPath: '' },
            {
              artifactNode: 'string.txt/6464-A22.txt',
              artifactRelPath: './foo'
            },
            {
              artifactNode: 'json.txt/1234-B11.txt',
              artifactRelPath: '/foo'
            },
            {
              artifactNode: 'pdf.txt/7424-B12.txt',
              artifactRelPath: ''
            }
          ],
          parent: [1574636514339],
          command: 'check-in',
          datetime: '2019-11-24T23:01:54.344Z',
          id: 1574636514344
        };

        man2 = {
          user: 'Bob',
          repo: 'ProjectX',
          structure: [
            { artifactNode: 'data.txt/7590-L11.txt', artifactRelPath: '' },
            {
              artifactNode: 'string.txt/9999-A00.txt',
              artifactRelPath: './foo'
            },
            { artifactNode: 'json.txt/9999-A00.txt', artifactRelPath: '/bar' },
            { artifactNode: 'html.txt/7424-B12.txt', artifactRelPath: '' }
          ],
          parent: [1574636514339],
          command: 'check-in',
          datetime: '2019-11-24T23:01:54.344Z',
          id: 1574636514344
        };
      });

      it('same manifest should result in 0 conflict', function() {
        expect(projHandler._gatherConflicts(man1, man1).length).to.be.equal(0);
      });

      it('should result in right number of conflict between two manifests', function() {
        expect(projHandler._gatherConflicts(man1, man2).length).to.be.equal(1);
      });

      it('should return an array', function() {
        expect(projHandler._gatherConflicts(man1, man2)).to.be.an('array');
      });

      it('should return correct answer', function() {
        expect(projHandler._gatherConflicts(man1, man2)).to.be.deep.equal([
          {
            source: {
              artifactNode: 'string.txt/6464-A22.txt',
              artifactRelPath: './foo'
            },
            target: {
              artifactNode: 'string.txt/9999-A00.txt',
              artifactRelPath: './foo'
            }
          }
        ]);
      });
    });

    describe('#manPath()', function() {
      beforeEach(() => {
        mockFS({
          alice: {
            alpha: {
              VSC_REPO_NAME: {
                MANIFEST_DIR: {
                  '1.json': '',
                  '2.json': '{parent: [1]}',
                  '3.json': '{parent: [2]}',
                  '4.json': '{parent: [3]}',
                  '6.json': '{parent: [4]}',
                  '7.json': '{parent: [6]}',
                  '10.json': '{parent: [7]}',
                  '12.json': '{parent: [10]}'
                }
              }
            }
          },
          bob: {
            alpha: {
              VSC_REPO_NAME: {
                MANIFEST_DIR: {
                  '5.json': `{parent: [4], fromPath: "alice/alpha"}`,
                  '8.json': '{parent: [5]}',
                  '11.json': '{parent: [8]}',
                  '13.json': '{parent: [11]}',
                  '14.json': '{parent: [13]}',
                  '15.json': '{parent: [14]}',
                  '16.json': '{parent: [15]}',
                  '17.json': '{parent: [16]}'
                }
              }
            }
          }
        });
      });

      afterEach(() => {
        mockFS.restore();
      });

      it('should return an array', function() {
        assert.typeOf(manPath(), 'array');
      });
    });
  });
});

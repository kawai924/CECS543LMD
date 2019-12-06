/*
 * Test Functions.js
 * Authors: Liam Nguyen | Matt Nguyen | Marco Curci | Dennis Lo
 * Contacts: nguyen.dch@gmail.com | matthewnguyen19@gmail.com | marco.curci@student.csulb.edu | dennis.lo@student.csulb.edu
 * LMD VSC Control - CECS 543 - Fall 2019
 */

const mockFS = require('mock-fs');
const assert = require('chai').assert;

const { isDir, makeQueue } = require('../private/js/Functions');

describe('Functions', function() {
  describe('Queue', function() {
    it('queue should be empty when initialized', function() {
      const queue = makeQueue();
      assert.isTrue(queue.isEmpty());
    });

    it('should follow FIFO', function() {
      const queue = makeQueue();
      queue.enqueue(2);
      queue.enqueue(3);
      assert.equal(queue.dequeue(), 3);
    });
  });

  describe('File System', function() {
    beforeEach(() => {
      mockFS({
        source: {
          'file.txt': '',
          folder1: {},
          folder2: {
            'nested.txt': ''
          }
        },
        target: {}
      });
    });

    afterEach(() => {
      mockFS.restore();
    });

    describe('#isDir()', function() {
      it('returns true for folder', function() {
        assert.isTrue(isDir('', 'source'));
      });

      it('return false for file', function() {
        assert.isFalse(isDir('source', 'file.txt'));
      });
    });
  });
});

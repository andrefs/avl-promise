import { describe, it } from 'mocha';
import { assert }       from 'chai';
import Promise          from 'bluebird';

import Tree from '../src/index';

describe('Duplicate keys', () => {

  it('should allow inserting of duplicate key', () => {
    const tree = new Tree();
    const keys = [2, 12, 1, -6, 1];

    return Promise.each(keys, k => tree.insert(k).then(() => assert.isTrue(tree.isBalanced())))
      .then(() => {
        assert.deepEqual(tree.keys(), [-6, 1, 1, 2, 12]);
        assert.equal(tree.size, 5);
        assert.isTrue(tree.isBalanced());
      });
  });


  it('should allow multiple duplicate keys in a row', () => {
    const tree = new Tree();
    const keys = [2, 12, 1, 1, -6, 2, 1, 1, 13];

    return Promise.each(keys, k => tree.insert(k).then(() => assert.isTrue(tree.isBalanced())))
      .then(() => {
        assert.deepEqual(tree.keys(), [ -6, 1, 1, 1, 1, 2, 2, 12, 13 ]);
        assert.equal(tree.size, 9);
        assert.isTrue(tree.isBalanced());
      });
  });

  // TODO - refactor to use loop or recursive
  it('should remove from a tree with duplicate keys correctly', () => {
    const tree = new Tree();
    const keys = [2, 12, 1, 1, -6, 1, 1];
    let size;

    return Promise.each(keys, k => tree.insert(k))
      .then(() => {
         size = tree.size;
         return tree.remove(1);
       })
       .then(() => {
          assert.eventually.isTrue(tree.contains(1));
          assert.isTrue(tree.isBalanced());
          assert.equal(tree.size, --size);
         return tree.remove(1);
       })
       .then(() => {
          assert.eventually.isTrue(tree.contains(1));
          assert.isTrue(tree.isBalanced());
          assert.equal(tree.size, --size);
         return tree.remove(1);
       })
       .then(() => {
          assert.eventually.isTrue(tree.contains(1));
          assert.isTrue(tree.isBalanced());
          assert.equal(tree.size, --size);
         return tree.remove(1);
       })
       .then(() => assert.eventually.isFalse(tree.contains(1)))
       .then(() => {
          assert.isTrue(tree.isBalanced());
          assert.equal(tree.size, --size);
          assert.isTrue(tree.isBalanced());
       });
  });

  it ('should remove from a tree with multiple duplicate keys correctly', () => {
    const tree = new Tree();
    const keys = [2, 12, 1, 1, -6, 1, 1, 2, 0, 2];

    const popAssert = (tree, size) => {
      if (tree.isEmpty) return Promise.resolve();

      return tree.pop()
        .then(() => {
          assert.isTrue(tree.isBalanced());
          assert.equal(tree.size, --size);
          return popAssert(tree, size);
        });
    };

    return Promise.each(keys, k => tree.insert(k))
      .then(() => {
        let size = tree.size;
        return popAssert(tree, size);
    });
  });

  it ('should disallow duplicates if noDuplicates is set', () => {
    const tree = new Tree(undefined, true);
    const keys = [2, 12, 1, -6, 1];

    return Promise.each(keys, k => tree.insert(k).then(() => assert.isTrue(tree.isBalanced())))
      .then((nodes) => {
        assert.deepEqual(tree.keys(), [-6, 1, 2, 12]);
        assert.equal(tree.size, 4);
        assert.isTrue(tree.isBalanced());
      });
  });

});

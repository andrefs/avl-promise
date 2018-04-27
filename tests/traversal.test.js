import { describe, it } from 'mocha';
import { assert }       from 'chai';
import Promise          from 'bluebird';

import Tree from '../src/index';

describe('traversal check', () => {

  it ('should traverse the tree in order', () => {
    const tree = new Tree();
    tree.insert(3)
      .then(() => tree.insert(1))
      .then(() => tree.insert(0))
      .then(() => tree.insert(2))
      .then(() => tree.forEach((n, i) => assert.equal(n.key, i)));
  });

  it('should find predecessor for the node', () => {
    const tree = new Tree();
    const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    return Promise.each(keys, k => tree.insert(k))
      .then(() => {
        const nodes = [];
        for (let i = 0; i < 10; i++) {
          nodes.push(tree.find(i));
        }

        return Promise.all(nodes);
      })
      .then(nodes => {
        const promises = [];

        for (let i = 1; i < 10; i++) {
          assert.strictEqual(tree.prev(nodes[i]), nodes[i - 1]);
        }
      });
  });

  it('should find successor for a node', () => {
    const tree = new Tree();
    const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    return Promise.each(keys, k => tree.insert(k))
      .then(() => {
        const nodes = [];
        for (let i = 0; i < 10; i++) {
          nodes.push(tree.find(i));
        }

        return Promise.all(nodes);
      })
      .then(nodes => {
        const promises = [];

        for (let i = 0; i < 9; i++) {
          assert.strictEqual(tree.next(nodes[i]), nodes[i + 1]);
        }
      });
  });

  it('should return null for predecessor of the min node', () => {
    const tree = new Tree();
    const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let min;

    return Promise.each(keys, k => tree.insert(k))
      .then(() => {
        min = tree.minNode();
        assert.isNull(tree.prev(min));
        return tree.remove(min.key);
      })
      .then(() => {
        min = tree.minNode();
        assert.isNull(tree.prev(min));
      });
  });

  it('should return null for successor of the max node', () => {
    const tree = new Tree();
    const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let max;

    return Promise.each(keys, k => tree.insert(k))
      .then(() => {
        max = tree.maxNode();
        assert.isNull(tree.next(max));
        return tree.remove(max.key);
      })
      .then(() => {
        max = tree.maxNode();
        assert.isNull(tree.next(max));
      });
  });

  it ('should find successor and predecessor for 2-nodes tree', () => {
    const tree = new Tree();
    return tree.insert(5)
      .then(() => tree.insert(10))
      .then(() => {
        let min = tree.minNode();
        assert.equal(min.key, 5);
        assert.isNull(tree.prev(min));
        assert.equal(tree.next(min).key, 10);

        let max = tree.maxNode();
        assert.equal(max.key, 10);
        assert.isNull(tree.next(max));
        assert.equal(tree.prev(max).key, 5);
      });
  });

  it ('should be able to get a node by its index', () => {
    const tree = new Tree();
    const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    return Promise.each(keys, k => tree.insert(k))
      .then(() => {
        for (let i = 0; i < 10; i++){
          assert.equal(tree.at(i).key, i);
        }

        assert.isNull(tree.at(10));
        assert.isNull(tree.at(-1));
        assert.isNull(tree.at('a'));
      });
  });

  // TODO - implement .range
  // it ('should support range walking', () => {
  //   const tree = new Tree();
  //   for (let i = 0; i < 10; i++) tree.insert(i);

  //   const arr = [];
  //   tree.range(3, 8, (n) => {
  //     arr.push(n.key);
  //   });
  //   assert.deepEqual(arr, [3,4,5,6,7,8]);
  // });

  // it ('should support range walking with non-existent low key', () => {
  //   const tree = new Tree();
  //   for (let i = 0; i < 10; i++) tree.insert(i);

  //   const arr = [];
  //   tree.range(-3,5, (n) => {
  //     arr.push(n.key);
  //   });

  //   assert.deepEqual(arr, [0,1,2,3,4,5]);
  // });

  // it ('should support range walking with non-existent high key', () => {
  //   const tree = new Tree();
  //   for (let i = 0; i < 10; i++) tree.insert(i);

  //   const arr = [];
  //   tree.range(3,15, (n) => {
  //     arr.push(n.key);
  //   });

  //   assert.deepEqual(arr, [3,4,5,6,7,8,9]);
  // });

  // it ('should support range walking with both keys out of range', () => {
  //   const tree = new Tree();
  //   for (let i = 0; i < 10; i++) tree.insert(i);

  //   const arr = [];
  //   tree.range(10, 20, (n) => {
  //     arr.push(n.key);
  //   });

  //   assert.equal(arr.length, 0);

  //   tree.range(-10, 20, (n) => {
  //     arr.push(n.key);
  //   });
  //   assert.deepEqual(arr, tree.keys());
  // });
});

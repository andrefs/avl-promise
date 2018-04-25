import { describe, it } from 'mocha';
import { assert }       from 'chai';

import Tree from '../src/index';


describe ('insert', () => {
  it('should return the size of the tree', () => {
    const tree = new Tree();
    return tree.insert(1)
      .then(() => tree.insert(2))
      .then(() => tree.insert(3))
      .then(() => tree.insert(4))
      .then(() => tree.insert(5))
      .then(() => assert.equal(tree.size, 5))
  });


  /**
   *         c
   *        / \           _b_
   *       b   z         /   \
   *      / \     ->    a     c
   *     a   y         / \   / \
   *    / \           w   x y   z
   *   w   x
   */
  it('should correctly balance the left left case', () => {
    const tree = new Tree();
    return tree.insert(3)
      .then(() => tree.insert(2))
      .then(() => tree.insert(1))
      .then(() => assert.equal(tree._root.key, 2));
  });

  /**
   *       c
   *      / \           _b_
   *     a   z         /   \
   *    / \     ->    a     c
   *   w   b         / \   / \
   *      / \       w   x y   z
   *     x   y
   */
  it('should correctly balance the left right case', () => {
    const tree = new Tree();
    tree.insert(3)
      .then(() => tree.insert(2))
      .then(() => tree.insert(2))
      .then(() => assert.equal(tree._root.key, 2));
  });

  /**
   *     a
   *    / \               _b_
   *   w   b             /   \
   *      / \     ->    a     c
   *     x   c         / \   / \
   *        / \       w   x y   z
   *       y   z
   */
  it('should correctly balance the right right case', () => {
    const tree = new Tree();
    tree.insert(1)
      .then(() => tree.insert(2))
      .then(() => tree.insert(3))
      .then(() => assert.equal(tree._root.key, 2));
  });

  /**
   *     a
   *    / \             _b_
   *   w   c           /   \
   *      / \   ->    a     c
   *     b   z       / \   / \
   *    / \         w   x y   z
   *   x   y
   */
  it('should correctly balance the right left case', () => {
    const tree = new Tree();
    tree.insert(1)
      .then(() => tree.insert(3))
      .then(() => tree.insert(2))
      .then(() => assert.equal(tree._root.key, 2));
  });

  it ('should allow bulk-insert', () => {
    const tree = new Tree();
    const keys = [1,2,3,4];
    const values = [4,3,2,1];
    return tree.load(keys, values)
      .then(() => {
        assert.deepEqual(tree.keys(), keys);
        assert.deepEqual(tree.values(), values);
      });
  });

  it ('should allow bulk-insert without values', () => {
    const tree = new Tree();
    const keys = [1,2,3,4];
    return tree.load(keys)
      .then(() => {
        assert.deepEqual(tree.keys(), keys);
        assert.deepEqual(tree.values(), keys.map(k => undefined));
      });
  });
});

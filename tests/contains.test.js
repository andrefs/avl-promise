import { describe, it } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const assert = chai.assert;

import Tree from '../src/index';

describe('contains check', () => {
  describe('sync', () => {

    it ('should return false if the tree is empty', () => {
      var tree = new Tree();
      assert.isFalse(tree.contains(1));
    });


    it ('should return whether the tree contains a node', () => {
      var tree = new Tree();
      assert.isFalse(tree.contains(1));
      assert.isFalse(tree.contains(2));
      assert.isFalse(tree.contains(3));
      tree.insert(3);
      tree.insert(1);
      tree.insert(2);
      assert.isTrue(tree.contains(1));
      assert.isTrue(tree.contains(2));
      assert.isTrue(tree.contains(3));
    });


    it ('should return false when the expected parent has no children', () => {
      var tree = new Tree();
      tree.insert(2);
      assert.isFalse(tree.contains(1));
      assert.isFalse(tree.contains(3));
    });
  });

  describe('async', () => {

    it ('should return false if the tree is empty', () => {
      var tree = new Tree();
      assert.eventually.isFalse(tree.containsAsync(1));
    });

    it ('should return whether the tree contains a node', () => {
      var tree = new Tree();
      assert.eventually.isFalse(tree.containsAsync(1));
      assert.eventually.isFalse(tree.containsAsync(2));
      assert.eventually.isFalse(tree.containsAsync(3));

     tree.insertAsync(3)
        .then(() => tree.insertAsync(1))
        .then(() => tree.insertAsync(2))
        .then(() => assert.eventually.isTrue(tree.containsAsync(1)))
        .then(() => assert.eventually.isTrue(tree.containsAsync(2)))
        .then(() => assert.eventually.isTrue(tree.containsAsync(3)));
    });


    it ('should return false when the expected parent has no children', () => {
      var tree = new Tree();
      return tree.insertAsync(2)
        .then(() => assert.eventually.isFalse(tree.containsAsync(1)))
        .then(() => assert.eventually.isFalse(tree.containsAsync(3)));
    });
  });

});

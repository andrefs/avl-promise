import { describe, it } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const assert = chai.assert;

import Tree from '../src/index';

describe('find', () => {

  describe('sync', () => {

    it('should return key as the result of search', () => {
      const tree = new Tree();
      assert.equal(tree.find(1), null);
      assert.equal(tree.find(2), null);
      assert.equal(tree.find(3), null);
      tree.insert(1, 4);
      tree.insert(2, 5);
      tree.insert(3, 6);
      assert.equal(tree.find(1).data, 4);
      assert.equal(tree.find(2).data, 5);
      assert.equal(tree.find(3).data, 6);
      assert.isNull(tree.find(8));
    });
  });

  describe('async', () => {
    const tree = new Tree();
      assert.eventually.equal(tree.findAsync(1), null);
      assert.eventually.equal(tree.findAsync(2), null);
      assert.eventually.equal(tree.findAsync(3), null);

      return tree.insertAsync(1, 4)
      .then(() => tree.insertAsync(2, 5))
      .then(() => tree.insertAsync(3, 6))
      .then(() => assert.eventually.propertyVal(tree.findAsync(1), 'data', 4))
      .then(() => assert.eventually.propertyVal(tree.findAsync(2), 'data', 5))
      .then(() => assert.eventually.propertyVal(tree.findAsync(3), 'data', 6))
      .then(() => assert.eventually.isNull(tree.findAsync(8)));
  });

})

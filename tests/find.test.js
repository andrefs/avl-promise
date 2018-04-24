import { describe, it } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const assert = chai.assert;

import Tree from '../src/index';

describe('find', () => {

  it('should return key as the result of search', () => {
    const tree = new Tree();
      assert.eventually.equal(tree.find(1), null);
      assert.eventually.equal(tree.find(2), null);
      assert.eventually.equal(tree.find(3), null);

      return tree.insert(1, 4)
      .then(() => tree.insert(2, 5))
      .then(() => tree.insert(3, 6))
      .then(() => assert.eventually.propertyVal(tree.find(1), 'data', 4))
      .then(() => assert.eventually.propertyVal(tree.find(2), 'data', 5))
      .then(() => assert.eventually.propertyVal(tree.find(3), 'data', 6))
      .then(() => assert.eventually.isNull(tree.find(8)));
  });

});

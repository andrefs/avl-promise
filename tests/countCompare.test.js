import { describe, it } from 'mocha';
import { assert }       from 'chai';

import Tree from '../src/index';


describe('compare calls counter', () => {
  it('should return zero when no operations were performed', () => {
    const tree = new Tree(null, false, true);
    assert.equal(tree._compareCallsCounter, 0);
  });

  it('should return 0 when only one element has been inserted', () => {
    const tree = new Tree(null, false, true);
    return tree.insert(1)
      .then(() => assert.equal(tree._compareCallsCounter, 0));
  });

  it('should return 2 when two elements were inserted', () => {
    const tree = new Tree(null, false, true);
    return tree.insert(1)
      .then(() => tree.insert(2))
      .then(() => assert.equal(tree._compareCallsCounter, 2));
  });

});

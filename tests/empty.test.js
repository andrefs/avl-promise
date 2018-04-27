import { describe, it } from 'mocha';
import { assert }       from 'chai';

import Tree from '../src/index';

describe ('empty check', () => {

  it('should return whether the tree is empty', () => {
    const tree = new Tree();

    assert.isTrue(tree.isEmpty());
    tree.insert(1)
      .then(() => assert.isFalse(tree.isEmpty()))
      .then(() => tree.remove(1))
      .then(() => assert.isTrue(tree.isEmpty()));
  });
});

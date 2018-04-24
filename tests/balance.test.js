import { describe, it } from 'mocha';
import { assert }       from 'chai';
import Promise          from 'bluebird';
import { print }        from '../src/utils';

import Tree from '../src/index';

describe('balance', () => {

  it('should be balance after in order insert', () => {
    const tree = new Tree();
    return tree.insert(1)
      .then(() => tree.insert(3))
      .then(() => tree.insert(2))
      .then(() => tree.insert(4))
      .then(() => tree.insert(0))
      .then(() => tree.insert(-10))
      .then(() => tree.insert(20))
      .then(() => assert.isTrue(tree.isBalanced()));
  });

  it('should be balance after random insert', () => {
    const tree = new Tree();
    const min = -100, max = 100;

    const keys = [];

    for (let i = 0; i < 20; i++) {
      keys.push(min + Math.floor((max - min) * Math.random()));
    }

    return Promise.each(keys, k => tree.insert(k))
      .then(() => assert.isTrue(tree.isBalanced()));
  });

});

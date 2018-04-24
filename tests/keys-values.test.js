import { describe, it } from 'mocha';
import { assert }       from 'chai';
import Promise          from 'bluebird';

import Tree from '../src/index';

describe('Keys and values', () => {

  it('should return sorted keys', () => {
    const t = new Tree((a, b) => Promise.resolve(b - a));
    t.insert(5)
    .then(() => t.insert(-10))
    .then(() => t.insert(0))
    .then(() => t.insert(33))
    .then(() => t.insert(2))
    .then(() => assert.deepEqual(t.keys(), [33, 5, 2, 0, -10]))
    .catch(x => console.log('XXXXXXXXXXXXx 1', x));
  });

  it ('should return sorted keys', () => {
    const t = new Tree();
    t.insert(5)
    .then(() => t.insert(-10))
    .then(() => t.insert(0))
    .then(() => t.insert(33))
    .then(() => t.insert(2))
    .then(() => assert.deepEqual(t.keys(), [-10, 0, 2, 5, 33]));
  });

  it ('should return sorted values', () => {
    const t = new Tree();
    t.insert(5,   'D')
    .then(() => t.insert(-10, 'A'))
    .then(() => t.insert(0,   'B'))
    .then(() => t.insert(33,  'E'))
    .then(() => t.insert(2,   'C'))
    .then(() => {
      assert.deepEqual(t.keys(), [-10, 0, 2, 5, 33]);
      assert.deepEqual(t.values(), ['A', 'B', 'C', 'D', 'E']);
    });
  });

  it ('should return sorted values', () => {
    const t = new Tree((a, b) => Promise.resolve(b - a));
    t.insert(5,   'D')
    .then(() => t.insert(-10, 'A'))
    .then(() => t.insert(0,   'B'))
    .then(() => t.insert(33,  'E'))
    .then(() => t.insert(2,   'C'))

    .then(() => {
      assert.deepEqual(t.keys(), [33, 5, 2, 0, -10]);
      assert.deepEqual(t.values(), ['E', 'D', 'C', 'B', 'A']);
    });
  });

  // TODO
  // it ('should return sorted values after bulk insert', () => {
  //   const t = new Tree();
  //   t.load([5, -10, 0, 33, 2], ['D', 'A', 'B', 'E', 'C']);

  //   assert.deepEqual(t.keys(), [-10, 0, 2, 5, 33]);
  //   assert.deepEqual(t.values(), ['A', 'B', 'C', 'D', 'E']);
  // });

});

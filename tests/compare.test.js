import { describe, it } from 'mocha';
import { assert }       from 'chai';
import Promise from 'bluebird';

import Tree from '../src/index';

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


describe ('custom comparator', () => {
  it('should function correctly given a non-reverse customCompare', () => {
    const tree = new Tree((a, b) => Promise.resolve(b - a));
    return tree.insert(2)
      .then(() => tree.insert(1))
      .then(() => tree.insert(3))
      .then(() => assert.equal(tree.size, 3))
      .then(() => assert.equal(tree.min(), 3))
      .then(() => assert.equal(tree.max(), 1))
      .then(() => tree.remove(3))
      .then(() => {
        assert.equal(tree.size, 2);
        assert.equal(tree._root.key, 2);
        assert.equal(tree._root.left, null);
        assert.equal(tree._root.right.key, 1);
      });
  });



  // TODO - array.sort can't handle async comparator
  //
  // it ('should support custom keys', () => {
  //   const comparator = (a, b) => Promise.resolve(a.value - b.value);
  //   const tree = new Tree(comparator);
  //   const objects = new Array(10).fill(0).map((n, i) => {
  //     return { value: i, data: Math.pow(i, 2) };
  //   });
  //   shuffle(objects);

  //   return Promise.each(objects, o => tree.insert(o))
  //     .then(() => assert.deepEqual(
  //       tree.keys().map(k => k.value),
  //       objects.slice().sort(comparator).map(k => k.value)
  //     ));
  // });

});

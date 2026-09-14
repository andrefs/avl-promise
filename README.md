# avl-promise

Promise-based [AVL tree](https://en.wikipedia.org/wiki/AVL_tree) for JavaScript.

[![npm version](https://img.shields.io/npm/v/avl-promise.svg)](https://www.npmjs.com/package/avl-promise)
[![npm license](https://img.shields.io/npm/l/avl-promise.svg)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/avl-promise.svg)](https://www.npmjs.com/package/avl-promise)

## Intro

Promise-based AVL-tree: Largely copied from [avl](https://www.npmjs.com/package/avl), but the comparator function returns a Promise!

Existing AVL modules perform all operations synchronously. But what if your custom `comparator` function is asynchronous? -- for example, if you need to perform a database query, a network request or wait for a user's input.

[avl-promise](https://www.npmjs.com/package/avl-promise) to the rescue! However, the performance takes a hit -- even if your async comparator immediately resolves to a numeric value. So, use with caution and at your own risk.

## Caveats

Because every comparison awaits a Promise, tree-building operations are dramatically slower than their synchronous counterparts — even when the comparator resolves instantly. Prefer a [synchronous AVL implementation](https://www.npmjs.com/package/avl) unless you truly need an asynchronous comparator, and measure before adopting this package in hot paths.

| Operation     | Average      | Worst case   |
| ------------- | ------------ | ------------ |
| Space         | **O(n)**     | **O(n)**     |
| Search        | **O(log n)** | **O(log n)** |
| Insert        | **O(log n)** | **O(log n)** |
| Delete        | **O(log n)** | **O(log n)** |

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [API](#api)
- [Benchmarks](#benchmarks)
- [Develop](#develop)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Install

```shell
npm i -S avl-promise
```

```js
import AVLTree from 'avl-promise';

const tree = new AVLTree();
```

In the browser, load the compiled UMD build together with [bluebird](http://bluebirdjs.com/) — the module exposes a global `AVLTree`:

```html
<script src="bluebird.js"></script>
<script src="dist/avl-promise.js"></script>
<script>
  const tree = new AVLTree();
</script>
```

[Try it in your browser](https://npm.runkit.com/avl-promise).

## Quick Start

```js
import AVLTree from 'avl-promise';

const tree = new AVLTree();

tree.insert(5)
  .then(() => tree.insert(-10))
  .then(() => tree.insert(0))
  .then(() => tree.insert(33))
  .then(() => tree.insert(2))
  .then(() => {
    console.log(tree.keys()); // [-10, 0, 2, 5, 33]
    console.log(tree.size);   // 5
    console.log(tree.min());  // -10
    console.log(tree.max());  // 33

    return tree.remove(0);
  })
  .then(() => console.log(tree.size)); // 4
```

**Custom comparator (reverse sort)**

The comparator must return a Promise that resolves to a number:

```js
import AVLTree from 'avl-promise';

const tree = new AVLTree((a, b) => Promise.resolve(b - a));

tree.insert(5)
  .then(() => tree.insert(-10))
  .then(() => tree.insert(0))
  .then(() => tree.insert(33))
  .then(() => tree.insert(2))
  .then(() => console.log(tree.keys())); // [33, 5, 2, 0, -10]
```

**Bulk insert**

```js
import AVLTree from 'avl-promise';

const tree = new AVLTree();

tree.load([3, 2, -10, 20], ['C', 'B', 'A', 'D'])
  .then(() => {
    console.log(tree.keys());   // [-10, 2, 3, 20]
    console.log(tree.values()); // ['A', 'B', 'C', 'D']
  });
```

## API

### Constructor

`new AVLTree([comparator], [noDuplicates=false], [countCompareCalls=false])`

* `comparator` — optional Promise-returning comparison function; defaults to a numeric comparison of the keys.
* `noDuplicates` — when `true`, inserting an existing key is a no-op (see [Duplicate keys](#duplicate-keys)).
* `countCompareCalls` — when `true`, the number of comparator invocations since the last compare-dependent call is exposed on `tree._compareCallsCounter` (useful for bench-marking).

### Synchronous methods

* `tree.size:number` - Number of nodes in the tree
* `tree.isEmpty():Boolean` - Whether the tree has no nodes
* `tree.destroy():Tree` - Empties the tree
* `tree.at(index:Number):Node|null` - Node at the given index in sorted key order
* `tree.forEach(function(node, index) {...}):Tree` - In-order traversal
* `tree.keys():Array<Key>` - All keys in sorted order
* `tree.values():Array<Value>` - All data fields in sorted order
* `tree.min():Key|null` - Minimum key
* `tree.max():Key|null` - Maximum key
* `tree.minNode():Node|null` - Node with the minimum key
* `tree.maxNode():Node|null` - Node with the maximum key
* `tree.prev(node):Node|null` - Predecessor of the given node
* `tree.next(node):Node|null` - Successor of the given node
* `tree.isBalanced():Boolean` - Whether the tree currently satisfies the AVL invariant
* `tree.toString([printNode]):String` - Primitive horizontal text representation (useful for debugging)

### Promise methods

The methods below depend on the `comparator` and return Promises.

* `tree.insert(key:any, [data:any]):Promise<Node>` - Insert a node
* `tree.find(key:any):Promise<Node|null>` - Node with the given key
* `tree.contains(key:any):Promise<Boolean>` - Whether a node with the given key exists
* `tree.remove(key:any):Promise<Key|null>` - Remove the node with the given key
* `tree.load(keys:Array<Key>, [values:Array<Value>]):Promise<Tree>` - Bulk-insert items
* `tree.pop():Promise<{key, data}|null>` - Remove and return the smallest node
* `tree.range(lo, high, function(node) {...} [, context]):Promise<Tree>` - Walk the keys between `lo` and `high` in order; stops early if the visitor returns a truthy value

### Comparator

`function(a:Key, b:Key):Promise<Number>` — resolves to:

* `0`  if the keys are equal
* `<0` if `a < b`
* `>0` if `a > b`

The comparator is the heart of the tree. An incorrect comparator can quietly produce a wrongly structured tree or make items unreachable. Test `comparator(a, b)` and `comparator(b, a)` for representative pairs to make sure they are consistent; inconsistent comparators cause bugs that are unpredictable and hard to debug.

### Duplicate keys

By default the tree allows duplicate keys. Pass `true` as the second constructor argument to reject them — inserting a key that is already present then silently does nothing. Duplicates are allowed by default because in some applications uniqueness cannot be guaranteed in advance (for example, overlapping points in 2D space).

## Benchmarks

Run the bundled comparison against several synchronous tree implementations:

```shell
npm run benchmark
```

As expected, the promise-based operations lose heavily to their synchronous counterparts — the async dispatch alone costs roughly three orders of magnitude on insert, and several hundred times on reads and removals. Benchmark numbers vary by machine and Node version; treat the exact figures as indicative, not gospel.

## Develop

```shell
npm i
npm test
npm run build
```

## Acknowledgements

Many thanks to [Alexander Milevski](https://github.com/w8r), whose module [avl](https://www.npmjs.com/package/avl) was adapted — both the code and the docs — with just the minimum changes needed to make it work asynchronously, to create [avl-promise](https://www.npmjs.com/package/avl-promise).

## License

Released under the [MIT](LICENSE) license. Copyright (c) 2018 André Santos.
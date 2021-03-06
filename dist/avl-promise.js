/**
 * avl-promise v0.1.0
 * Largely copied from avl (https://www.npmjs.com/package/avl), but with a Promise-based comparator!
 *
 * @author André Santos <andrefs@andrefs.com>
 * @license MIT
 * @preserve
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('bluebird')) :
	typeof define === 'function' && define.amd ? define(['bluebird'], factory) :
	(global.AVLTree = factory(global.Promise));
}(this, (function (Promise) { 'use strict';

Promise = Promise && Promise.hasOwnProperty('default') ? Promise['default'] : Promise;

/**
 * Prints tree horizontally
 * @param  {Node}                       root
 * @param  {Function(node:Node):String} [printNode]
 * @return {String}
 */
function print (root, printNode) {
  if ( printNode === void 0 ) printNode = function (n) { return n.key; };

  var out = [];
  row(root, '', true, function (v) { return out.push(v); }, printNode);
  return out.join('');
}

/**
 * Prints level of the tree
 * @param  {Node}                        root
 * @param  {String}                      prefix
 * @param  {Boolean}                     isTail
 * @param  {Function(in:string):void}    out
 * @param  {Function(node:Node):String}  printNode
 */
function row (root, prefix, isTail, out, printNode) {
  if (root) {
    out(("" + prefix + (isTail ? '└── ' : '├── ') + (printNode(root)) + "\n"));
    var indent = prefix + (isTail ? '    ' : '│   ');
    if (root.left)  { row(root.left,  indent, false, out, printNode); }
    if (root.right) { row(root.right, indent, true,  out, printNode); }
  }
}


/**
 * Is the tree balanced (none of the subtrees differ in height by more than 1)
 * @param  {Node}    root
 * @return {Boolean}
 */
function isBalanced(root) {
  if (root === null) { return true; } // If node is empty then return true

  // Get the height of left and right sub trees
  var lh = height(root.left);
  var rh = height(root.right);

  if (Math.abs(lh - rh) <= 1 &&
      isBalanced(root.left)  &&
      isBalanced(root.right)) { return true; }

  // If we reach here then tree is not height-balanced
  return false;
}

/**
 * The function Compute the 'height' of a tree.
 * Height is the number of nodes along the longest path
 * from the root node down to the farthest leaf node.
 *
 * @param  {Node} node
 * @return {Number}
 */
function height(node) {
  return node ? (1 + Math.max(height(node.left), height(node.right))) : 0;
}

// TODO update doc comments
// TODO remove dead code

// function createNode (parent, left, right, height, key, data) {
//   return { parent, left, right, balanceFactor: height, key, data };
// }

/**
 * @typedef {{
 *   parent:        ?Node,
 *   left:          ?Node,
 *   right:         ?Node,
 *   balanceFactor: number,
 *   key:           Key,
 *   data:          Value
 * }} Node
 */

/**
 * @typedef {*} Key
 */

/**
 * @typedef {*} Value
 */

/**
 * Default comparison function
 * @param {Key} a
 * @param {Key} b
 * @returns {number}
 */

function DEFAULT_COMPARE_ASYNC (a, b) {
  return a > b ?
    Promise.resolve(1) :
    a < b ?
      Promise.resolve(-1) :
      Promise.resolve(0);
}

/**
 * Single left rotation
 * @param  {Node} node
 * @return {Node}
 */
function rotateLeft (node) {
  var rightNode = node.right;
  node.right    = rightNode.left;

  if (rightNode.left) { rightNode.left.parent = node; }

  rightNode.parent = node.parent;
  if (rightNode.parent) {
    if (rightNode.parent.left === node) {
      rightNode.parent.left = rightNode;
    } else {
      rightNode.parent.right = rightNode;
    }
  }

  node.parent    = rightNode;
  rightNode.left = node;

  node.balanceFactor += 1;
  if (rightNode.balanceFactor < 0) {
    node.balanceFactor -= rightNode.balanceFactor;
  }

  rightNode.balanceFactor += 1;
  if (node.balanceFactor > 0) {
    rightNode.balanceFactor += node.balanceFactor;
  }
  return rightNode;
}


function rotateRight (node) {
  var leftNode = node.left;
  node.left = leftNode.right;
  if (node.left) { node.left.parent = node; }

  leftNode.parent = node.parent;
  if (leftNode.parent) {
    if (leftNode.parent.left === node) {
      leftNode.parent.left = leftNode;
    } else {
      leftNode.parent.right = leftNode;
    }
  }

  node.parent    = leftNode;
  leftNode.right = node;

  node.balanceFactor -= 1;
  if (leftNode.balanceFactor > 0) {
    node.balanceFactor -= leftNode.balanceFactor;
  }

  leftNode.balanceFactor -= 1;
  if (node.balanceFactor < 0) {
    leftNode.balanceFactor += node.balanceFactor;
  }

  return leftNode;
}


// function leftBalance (node) {
//   if (node.left.balanceFactor === -1) rotateLeft(node.left);
//   return rotateRight(node);
// }


// function rightBalance (node) {
//   if (node.right.balanceFactor === 1) rotateRight(node.right);
//   return rotateLeft(node);
// }


var AVLTree = function AVLTree (comparator, noDuplicates, countCompareCalls) {
  var this$1 = this;
  if ( noDuplicates === void 0 ) noDuplicates = false;
  if ( countCompareCalls === void 0 ) countCompareCalls = false;

  this._root = null;
  this._size = 0;
  this._countCompareCalls = !!countCompareCalls;
  this._compareCallsCounter = 0;
  this._noDuplicates = !!noDuplicates;

  var incWrapper = function (f) { return function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    this$1._compareCallsCounter++;
    return f.apply(void 0, args);
  }; };

  this._comparatorAsync = this._countCompareCalls ?
    incWrapper(comparator || DEFAULT_COMPARE_ASYNC) :
    comparator || DEFAULT_COMPARE_ASYNC;
};

var prototypeAccessors = { size: {} };


/**
 * Clear the tree
 * @return {AVLTree}
 */
AVLTree.prototype.destroy = function destroy () {
  this._root = null;
  return this;
};

/**
 * Number of nodes
 * @return {number}
 */
prototypeAccessors.size.get = function () {
  return this._size;
};


/**
 * Whether the tree contains a node with the given key
 * @param{Key} key
 * @return {boolean} true/false
 */

AVLTree.prototype.contains = function contains (key) {
  if (this._countCompareCalls) {
    this._compareCallsCounter = 0;
  }
  return this._containsAsync(key, this._root);
};

AVLTree.prototype._containsAsync = function _containsAsync (key, node) {
    var this$1 = this;

  if (!node) { return Promise.resolve(false); }
  return this._comparatorAsync(key, node.key)
    .then(function (cmp) {
      if (cmp === 0) { return Promise.resolve(true); }
      if (cmp<0) { return this$1._containsAsync(key, node.left); }
      return this$1._containsAsync(key, node.right);
    });
};


/* eslint-disable class-methods-use-this */

/**
 * Successor node
 * @param{Node} node
 * @return {?Node}
 */
AVLTree.prototype.next = function next (node) {
  var successor = node;
  if (successor) {
    if (successor.right) {
      successor = successor.right;
      while (successor && successor.left) { successor = successor.left; }
    } else {
      successor = node.parent;
      while (successor && successor.right === node) {
        node = successor; successor = successor.parent;
      }
    }
  }
  return successor;
};


/**
 * Predecessor node
 * @param{Node} node
 * @return {?Node}
 */
AVLTree.prototype.prev = function prev (node) {
  var predecessor = node;
  if (predecessor) {
    if (predecessor.left) {
      predecessor = predecessor.left;
      while (predecessor && predecessor.right) { predecessor = predecessor.right; }
    } else {
      predecessor = node.parent;
      while (predecessor && predecessor.left === node) {
        node = predecessor;
        predecessor = predecessor.parent;
      }
    }
  }
  return predecessor;
};
/* eslint-enable class-methods-use-this */


/**
 * Callback for forEach
 * @callback forEachCallback
 * @param {Node} node
 * @param {number} index
 */

/**
 * @param{forEachCallback} callback
 * @return {AVLTree}
 */
AVLTree.prototype.forEach = function forEach (callback) {
  var current = this._root;
  var s = [], done = false, i = 0;

  while (!done) {
    // Reach the left most Node of the current Node
    if (current) {
      // Place pointer to a tree node on the stack
      // before traversing the node's left subtree
      s.push(current);
      current = current.left;
    } else {
      // BackTrack from the empty subtree and visit the Node
      // at the top of the stack; however, if the stack is
      // empty you are done
      if (s.length > 0) {
        current = s.pop();
        callback(current, i++);

        // We have visited the node and its left
        // subtree. Now, it's right subtree's turn
        current = current.right;
      } else { done = true; }
    }
  }
  return this;
};


/**
 * Walk key range from `low` to `high`. Stops if `fn` returns a value.
 * @param{Key}    low
 * @param{Key}    high
 * @param{Function} fn
 * @param{*?}     ctx
 * @return {SplayTree}
 */
AVLTree.prototype.range = function range (low, high, fn, ctx) {
  if (this._countCompareCalls) {
    this._compareCallsCounter = 0;
  }
  var Q = [];
  var node = this._root;

  return this._range(Q, node, high, low, fn, ctx);
};

AVLTree.prototype._range = function _range (Q, node, high, low, fn, ctx) {
    var this$1 = this;

  if (Q.length === 0 && !node) { return Promise.resolve(this); }

  if (node) {
    Q.push(node);
    node = node.left;
    return this._range(Q, node, high, low, fn, ctx);
  }
  node = Q.pop();
  return this._comparatorAsync(node.key, high)
    .then(function (cmp) {
      if (cmp > 0) { return Promise.resolve(this$1); }

      return this$1._comparatorAsync(node.key, low)
        .then(function (cmp) {
          if (cmp >= 0) { return Promise.resolve(fn.call(ctx, node)); }
          return Promise.resolve();
        })
        .then(function (res) {
          if (res) { return Promise.resolve(this$1); }

          node = node.right;
          return this$1._range(Q, node, high, low, fn, ctx);
        });
    });
};


/**
 * Returns all keys in order
 * @return {Array<Key>}
 */
AVLTree.prototype.keys = function keys () {
  var current = this._root;
  var s = [], r = [], done = false;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        r.push(current.key);
        current = current.right;
      } else { done = true; }
    }
  }
  return r;
};


/**
 * Returns `data` fields of all nodes in order.
 * @return {Array<Value>}
 */
AVLTree.prototype.values = function values () {
  var current = this._root;
  var s = [], r = [], done = false;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        r.push(current.data);
        current = current.right;
      } else { done = true; }
    }
  }
  return r;
};


/**
 * Returns node at given index
 * @param{number} index
 * @return {?Node}
 */
AVLTree.prototype.at = function at (index) {
  // removed after a consideration, more misleading than useful
  // index = index % this.size;
  // if (index < 0) index = this.size - index;

  var current = this._root;
  var s = [], done = false, i = 0;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        if (i === index) { return current; }
        i++;
        current = current.right;
      } else { done = true; }
    }
  }
  return null;
};


/**
 * Returns node with the minimum key
 * @return {?Node}
 */
AVLTree.prototype.minNode = function minNode () {
  var node = this._root;
  if (!node) { return null; }
  while (node.left) { node = node.left; }
  return node;
};


/**
 * Returns node with the max key
 * @return {?Node}
 */
AVLTree.prototype.maxNode = function maxNode () {
  var node = this._root;
  if (!node) { return null; }
  while (node.right) { node = node.right; }
  return node;
};


/**
 * Min key
 * @return {?Key}
 */
AVLTree.prototype.min = function min () {
  var node = this._root;
  if (!node) { return null; }
  while (node.left) { node = node.left; }
  return node.key;
};


/**
 * Max key
 * @return {?Key}
 */
AVLTree.prototype.max = function max () {
  var node = this._root;
  if (!node) { return null; }
  while (node.right) { node = node.right; }
  return node.key;
};


/**
 * @return {boolean} true/false
 */
AVLTree.prototype.isEmpty = function isEmpty () {
  return !this._root;
};


/**
 * Removes and returns the node with smallest key
 * @return {?Node}
 */
AVLTree.prototype.pop = function pop () {
  var node = this._root;
  if (node) {
    while (node.left) { node = node.left; }
    var res = { key: node.key, data: node.data };
    return this.remove(node.key)
      .then(function () { return res; });
  }
  return Promise.resolve(null);
};


/**
 * Find node by key
 * @param{Key} key
 * @return {?Node}
 */

AVLTree.prototype.find = function find (key) {
  if (this._countCompareCalls) {
    this._compareCallsCounter = 0;
  }
  return this._findAsync(key, this._root);
};

AVLTree.prototype._findAsync = function _findAsync (key, node) {
    var this$1 = this;

  if (!node) { return Promise.resolve(null); }
  return this._comparatorAsync(key, node.key)
    .then(function (cmp) {
      if (cmp < 0) { return this$1._findAsync(key, node.left); }
      if (cmp > 0) { return this$1._findAsync(key, node.right); }
      return Promise.resolve(node);
    });
};


/**
 * Insert a node into the tree
 * @param{Key} key
 * @param{Value} [data]
 * @return {?Node}
 */

AVLTree.prototype.insert = function insert (key, data) {
  if (this._countCompareCalls) {
    this._compareCallsCounter = 0;
  }
  return this._insert(key, data);
};

AVLTree.prototype._insert = function _insert (key, data) {
  if (!this._root) {
    this._root = {
      parent: null, left: null, right: null, balanceFactor: 0,
      key: key, data: data
    };
    this._size++;
    return Promise.resolve(this._root);
  }
  return Promise.resolve(this._insertAsync(key, data, this._root, this._noDuplicates));
};

AVLTree.prototype._findParent = function _findParent (key, node) {
    var this$1 = this;

  return this._comparatorAsync(key, node.key)
    .then(function (cmp) {
      if (cmp === 0 && this$1._noDuplicates) {
        return Promise.resolve([node, cmp]);
      }
      if (cmp <= 0) {
        return node.left ?
          this$1._findParent(key, node.left, this$1._noDuplicates) :
          Promise.resolve([node, cmp]);
      }
      return node.right ?
        this$1._findParent(key, node.right, this$1._noDuplicates) :
        Promise.resolve([node, cmp]);
    });
};

AVLTree.prototype._rebalanceInsert = function _rebalanceInsert (parent, key) {
    var this$1 = this;

  var newRoot;

  if (!parent) {
    this._size++;
    return Promise.resolve();
  }

  return this._comparatorAsync(parent.key, key)
    .then(function (cmp) {
      if (cmp < 0) { parent.balanceFactor -= 1; }
      else { parent.balanceFactor += 1; }

      if (parent.balanceFactor === 0) {
        this$1._size++;
        return Promise.resolve();
      } else if (parent.balanceFactor < -1) {
        if (parent.right.balanceFactor === 1) { rotateRight(parent.right); }
        newRoot = rotateLeft(parent);

        if (parent === this$1._root) { this$1._root = newRoot; }
        this$1._size++;
        return Promise.resolve();
      } else if (parent.balanceFactor > 1) {
        if (parent.left.balanceFactor === -1) { rotateLeft(parent.left); }
        newRoot = rotateRight(parent);

        if (parent === this$1._root) { this$1._root = newRoot; }
        this$1._size++;
        return Promise.resolve();
      }
      return this$1._rebalanceInsert(parent.parent, key);
    });
};

AVLTree.prototype._insertAsync = function _insertAsync (key, data, node) {
    var this$1 = this;

  var newNode;
  return this._findParent(key, node)
    .then(function (ref) {
        var parent = ref[0];
        var cmp = ref[1];

      if (cmp === 0 && this$1._noDuplicates) { return null; }
      newNode = {
        left: null,
        right: null,
        balanceFactor: 0,
        parent: parent, key: key, data: data
      };

      if (cmp <= 0) { parent.left= newNode; }
      else { parent.right = newNode; }

      return this$1._rebalanceInsert(parent, key);
    })
    .then(function () { return newNode; });
};

AVLTree.prototype._rebalanceRemove = function _rebalanceRemove (parent, pp) {
  var newRoot;

  if (!parent) { return Promise.resolve(); }

  if (parent.left === pp) { parent.balanceFactor -= 1; }
  else                  { parent.balanceFactor += 1; }

  if (parent.balanceFactor < -1) {
    if (parent.right.balanceFactor === 1) { rotateRight(parent.right); }
    newRoot = rotateLeft(parent);

    if (parent === this._root) { this._root = newRoot; }
    parent = newRoot;

    return Promise.resolve();
  } else if (parent.balanceFactor > 1) {
    if (parent.left.balanceFactor === -1) { rotateLeft(parent.left); }
    newRoot = rotateRight(parent);

    if (parent === this._root) { this._root = newRoot; }
    return Promise.resolve();
  }

  if (parent.balanceFactor === -1 || parent.balanceFactor === 1) {
    return Promise.resolve();
  }

  return this._rebalanceRemove(parent.parent, parent);
};

/**
 * Removes the node from the tree. If not found, returns null.
 * @param{Key} key
 * @return {?Node}
 */
AVLTree.prototype.remove = function remove (key) {
    var this$1 = this;

  if (!this._root) { return null; }

  return this._findAsync(key, this._root)
    .then(function (node) {
      if (!node) { return Promise.resolve(); }

      var returnValue = node.key;
      var max, min;

      if (node.left) {
        max = node.left;

        while (max.left || max.right) {
          while (max.right) { max = max.right; }

          node.key = max.key;
          node.data = max.data;
          if (max.left) {
            node = max;
            max = max.left;
          }
        }

        node.key= max.key;
        node.data = max.data;
        node = max;
      }

      if (node.right) {
        min = node.right;

        while (min.left || min.right) {
          while (min.left) { min = min.left; }

          node.key= min.key;
          node.data = min.data;
          if (min.right) {
            node = min;
            min = min.right;
          }
        }

        node.key= min.key;
        node.data = min.data;
        node = min;
      }

      var parent = node.parent;
      var pp   = node;

      return this$1._rebalanceRemove(parent, pp)
        .then(function () {
          if (node.parent) {
            if (node.parent.left === node) { node.parent.left= null; }
            else                         { node.parent.right = null; }
          }

          if (node === this$1._root) { this$1._root = null; }

          this$1._size--;
          return Promise.resolve(returnValue);
        });
    });
};

/**
 * Bulk-load items
 * @param{Array<Key>}keys
 * @param{Array<Value>}[values]
 * @return {AVLTree}
 */
AVLTree.prototype.load = function load (keys, values) {
    var this$1 = this;
    if ( keys === void 0 ) keys = [];
    if ( values === void 0 ) values = [];

  if (this._countCompareCalls) {
    this._compareCallsCounter = 0;
  }
  if (!Array.isArray(keys)) { return this; }

  var pairs = [];
  keys.forEach(function (k, i) { return pairs.push({ k: k, v: values[i] }); });

  return Promise.each(pairs, function (p) { return this$1._insert(p.k, p.v); })
    .then(function () { return this$1; });
};


/**
 * Returns true if the tree is balanced
 * @return {boolean}
 */
AVLTree.prototype.isBalanced = function isBalanced$1 () {
  return isBalanced(this._root);
};


/**
 * String representation of the tree - primitive horizontal print-out
 * @param{Function(Node):string} [printNode]
 * @return {string}
 */
AVLTree.prototype.toString = function toString (printNode) {
  return print(this._root, printNode);
};

Object.defineProperties( AVLTree.prototype, prototypeAccessors );

AVLTree.default = AVLTree;

return AVLTree;

})));
//# sourceMappingURL=avl-promise.js.map

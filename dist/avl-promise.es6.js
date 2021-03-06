/**
 * avl-promise v0.1.0
 * Largely copied from avl (https://www.npmjs.com/package/avl), but with a Promise-based comparator!
 *
 * @author André Santos <andrefs@andrefs.com>
 * @license MIT
 * @preserve
 */

import Promise from 'bluebird';

/**
 * Prints tree horizontally
 * @param  {Node}                       root
 * @param  {Function(node:Node):String} [printNode]
 * @return {String}
 */
function print (root, printNode = (n) => n.key) {
  var out = [];
  row(root, '', true, (v) => out.push(v), printNode);
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
    out(`${ prefix }${ isTail ? '└── ' : '├── ' }${ printNode(root) }\n`);
    const indent = prefix + (isTail ? '    ' : '│   ');
    if (root.left)  row(root.left,  indent, false, out, printNode);
    if (root.right) row(root.right, indent, true,  out, printNode);
  }
}


/**
 * Is the tree balanced (none of the subtrees differ in height by more than 1)
 * @param  {Node}    root
 * @return {Boolean}
 */
function isBalanced(root) {
  if (root === null) return true; // If node is empty then return true

  // Get the height of left and right sub trees
  var lh = height(root.left);
  var rh = height(root.right);

  if (Math.abs(lh - rh) <= 1 &&
      isBalanced(root.left)  &&
      isBalanced(root.right)) return true;

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

  if (rightNode.left) rightNode.left.parent = node;

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
  if (node.left) node.left.parent = node;

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


class AVLTree {
  /**
   * Callback for comparator
   * @callback comparatorCallback
   * @param {Key} a
   * @param {Key} b
   * @returns {number}
   */

  /**
   * @class AVLTree
   * @constructor
   * @param  {comparatorCallback} [comparator]
   * @param  {boolean}            [noDuplicates=false] Disallow duplicates
   */
  constructor (comparator, noDuplicates = false, countCompareCalls = false) {
    this._root = null;
    this._size = 0;
    this._countCompareCalls = !!countCompareCalls;
    this._compareCallsCounter = 0;
    this._noDuplicates = !!noDuplicates;

    const incWrapper = (f) => (...args) => {
      this._compareCallsCounter++;
      return f(...args);
    };

    this._comparatorAsync = this._countCompareCalls ?
      incWrapper(comparator || DEFAULT_COMPARE_ASYNC) :
      comparator || DEFAULT_COMPARE_ASYNC;
  }


  /**
   * Clear the tree
   * @return {AVLTree}
   */
  destroy() {
    this._root = null;
    return this;
  }

  /**
   * Number of nodes
   * @return {number}
   */
  get size () {
    return this._size;
  }


  /**
   * Whether the tree contains a node with the given key
   * @param  {Key} key
   * @return {boolean} true/false
   */

  contains (key) {
    if (this._countCompareCalls) {
      this._compareCallsCounter = 0;
    }
    return this._containsAsync(key, this._root);
  }

  _containsAsync (key, node) {
    if (!node) { return Promise.resolve(false); }
    return this._comparatorAsync(key, node.key)
      .then(cmp => {
        if (cmp === 0) return Promise.resolve(true);
        if (cmp  <  0) return this._containsAsync(key, node.left);
        return this._containsAsync(key, node.right);
      });
  }


  /* eslint-disable class-methods-use-this */

  /**
   * Successor node
   * @param  {Node} node
   * @return {?Node}
   */
  next (node) {
    var successor = node;
    if (successor) {
      if (successor.right) {
        successor = successor.right;
        while (successor && successor.left) successor = successor.left;
      } else {
        successor = node.parent;
        while (successor && successor.right === node) {
          node = successor; successor = successor.parent;
        }
      }
    }
    return successor;
  }


  /**
   * Predecessor node
   * @param  {Node} node
   * @return {?Node}
   */
  prev (node) {
    var predecessor = node;
    if (predecessor) {
      if (predecessor.left) {
        predecessor = predecessor.left;
        while (predecessor && predecessor.right) predecessor = predecessor.right;
      } else {
        predecessor = node.parent;
        while (predecessor && predecessor.left === node) {
          node = predecessor;
          predecessor = predecessor.parent;
        }
      }
    }
    return predecessor;
  }
  /* eslint-enable class-methods-use-this */


  /**
   * Callback for forEach
   * @callback forEachCallback
   * @param {Node} node
   * @param {number} index
   */

  /**
   * @param  {forEachCallback} callback
   * @return {AVLTree}
   */
  forEach(callback) {
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
        } else done = true;
      }
    }
    return this;
  }


  /**
   * Walk key range from `low` to `high`. Stops if `fn` returns a value.
   * @param  {Key}      low
   * @param  {Key}      high
   * @param  {Function} fn
   * @param  {*?}       ctx
   * @return {SplayTree}
   */
  range(low, high, fn, ctx) {
    if (this._countCompareCalls) {
      this._compareCallsCounter = 0;
    }
    const Q = [];
    let node = this._root;

    return this._range(Q, node, high, low, fn, ctx);
  }

  _range (Q, node, high, low, fn, ctx) {
    if (Q.length === 0 && !node) return Promise.resolve(this);

    if (node) {
      Q.push(node);
      node = node.left;
      return this._range(Q, node, high, low, fn, ctx);
    }
    node = Q.pop();
    return this._comparatorAsync(node.key, high)
      .then(cmp => {
        if (cmp > 0) return Promise.resolve(this);

        return this._comparatorAsync(node.key, low)
          .then(cmp => {
            if (cmp >= 0) return Promise.resolve(fn.call(ctx, node));
            return Promise.resolve();
          })
          .then(res => {
            if (res) return Promise.resolve(this);

            node = node.right;
            return this._range(Q, node, high, low, fn, ctx);
          });
      });
  }


  /**
   * Returns all keys in order
   * @return {Array<Key>}
   */
  keys () {
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
        } else done = true;
      }
    }
    return r;
  }


  /**
   * Returns `data` fields of all nodes in order.
   * @return {Array<Value>}
   */
  values () {
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
        } else done = true;
      }
    }
    return r;
  }


  /**
   * Returns node at given index
   * @param  {number} index
   * @return {?Node}
   */
  at (index) {
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
          if (i === index) return current;
          i++;
          current = current.right;
        } else done = true;
      }
    }
    return null;
  }


  /**
   * Returns node with the minimum key
   * @return {?Node}
   */
  minNode () {
    var node = this._root;
    if (!node) return null;
    while (node.left) node = node.left;
    return node;
  }


  /**
   * Returns node with the max key
   * @return {?Node}
   */
  maxNode () {
    var node = this._root;
    if (!node) return null;
    while (node.right) node = node.right;
    return node;
  }


  /**
   * Min key
   * @return {?Key}
   */
  min () {
    var node = this._root;
    if (!node) return null;
    while (node.left) node = node.left;
    return node.key;
  }


  /**
   * Max key
   * @return {?Key}
   */
  max () {
    var node = this._root;
    if (!node) return null;
    while (node.right) node = node.right;
    return node.key;
  }


  /**
   * @return {boolean} true/false
   */
  isEmpty() {
    return !this._root;
  }


  /**
   * Removes and returns the node with smallest key
   * @return {?Node}
   */
  pop () {
    var node = this._root;
    if (node) {
      while (node.left) node = node.left;
      const res = { key: node.key, data: node.data };
      return this.remove(node.key)
        .then(() => res);
    }
    return Promise.resolve(null);
  }


  /**
   * Find node by key
   * @param  {Key} key
   * @return {?Node}
   */

  find (key) {
    if (this._countCompareCalls) {
      this._compareCallsCounter = 0;
    }
    return this._findAsync(key, this._root);
  }

  _findAsync (key, node) {
    if (!node) return Promise.resolve(null);
    return this._comparatorAsync(key, node.key)
      .then(cmp => {
        if (cmp < 0) return this._findAsync(key, node.left);
        if (cmp > 0) return this._findAsync(key, node.right);
        return Promise.resolve(node);
      });
  }


  /**
   * Insert a node into the tree
   * @param  {Key} key
   * @param  {Value} [data]
   * @return {?Node}
   */

  insert (key, data) {
    if (this._countCompareCalls) {
      this._compareCallsCounter = 0;
    }
    return this._insert(key, data);
  }

  _insert (key, data) {
    if (!this._root) {
      this._root = {
        parent: null, left: null, right: null, balanceFactor: 0,
        key, data
      };
      this._size++;
      return Promise.resolve(this._root);
    }
    return Promise.resolve(this._insertAsync(key, data, this._root, this._noDuplicates));
  }

  _findParent (key, node) {
    return this._comparatorAsync(key, node.key)
      .then(cmp => {
        if (cmp === 0 && this._noDuplicates) {
          return Promise.resolve([node, cmp]);
        }
        if (cmp <= 0) {
          return node.left ?
            this._findParent(key, node.left, this._noDuplicates) :
            Promise.resolve([node, cmp]);
        }
        return node.right ?
          this._findParent(key, node.right, this._noDuplicates) :
          Promise.resolve([node, cmp]);
      });
  }

  _rebalanceInsert (parent, key) {
    let newRoot;

    if (!parent) {
      this._size++;
      return Promise.resolve();
    }

    return this._comparatorAsync(parent.key, key)
      .then(cmp => {
        if (cmp < 0) parent.balanceFactor -= 1;
        else parent.balanceFactor += 1;

        if (parent.balanceFactor === 0) {
          this._size++;
          return Promise.resolve();
        } else if (parent.balanceFactor < -1) {
          if (parent.right.balanceFactor === 1) rotateRight(parent.right);
          newRoot = rotateLeft(parent);

          if (parent === this._root) this._root = newRoot;
          this._size++;
          return Promise.resolve();
        } else if (parent.balanceFactor > 1) {
          if (parent.left.balanceFactor === -1) rotateLeft(parent.left);
          newRoot = rotateRight(parent);

          if (parent === this._root) this._root = newRoot;
          this._size++;
          return Promise.resolve();
        }
        return this._rebalanceInsert(parent.parent, key);
      });
  }

  _insertAsync (key, data, node) {
    let newNode;
    return this._findParent(key, node)
      .then(([parent, cmp]) => {
        if (cmp === 0 && this._noDuplicates) return null;
        newNode = {
          left: null,
          right: null,
          balanceFactor: 0,
          parent, key, data
        };

        if (cmp <= 0) parent.left  = newNode;
        else parent.right = newNode;

        return this._rebalanceInsert(parent, key);
      })
      .then(() => newNode);
  }

  _rebalanceRemove (parent, pp) {
    let newRoot;

    if (!parent) return Promise.resolve();

    if (parent.left === pp) parent.balanceFactor -= 1;
    else                    parent.balanceFactor += 1;

    if (parent.balanceFactor < -1) {
      if (parent.right.balanceFactor === 1) rotateRight(parent.right);
      newRoot = rotateLeft(parent);

      if (parent === this._root) this._root = newRoot;
      parent = newRoot;

      return Promise.resolve();
    } else if (parent.balanceFactor > 1) {
      if (parent.left.balanceFactor === -1) rotateLeft(parent.left);
      newRoot = rotateRight(parent);

      if (parent === this._root) this._root = newRoot;
      return Promise.resolve();
    }

    if (parent.balanceFactor === -1 || parent.balanceFactor === 1) {
      return Promise.resolve();
    }

    return this._rebalanceRemove(parent.parent, parent);
  }

  /**
   * Removes the node from the tree. If not found, returns null.
   * @param  {Key} key
   * @return {?Node}
   */
  remove (key) {
    if (!this._root) return null;

    return this._findAsync(key, this._root)
      .then(node => {
        if (!node) return Promise.resolve();

        var returnValue = node.key;
        var max, min;

        if (node.left) {
          max = node.left;

          while (max.left || max.right) {
            while (max.right) max = max.right;

            node.key = max.key;
            node.data = max.data;
            if (max.left) {
              node = max;
              max = max.left;
            }
          }

          node.key  = max.key;
          node.data = max.data;
          node = max;
        }

        if (node.right) {
          min = node.right;

          while (min.left || min.right) {
            while (min.left) min = min.left;

            node.key  = min.key;
            node.data = min.data;
            if (min.right) {
              node = min;
              min = min.right;
            }
          }

          node.key  = min.key;
          node.data = min.data;
          node = min;
        }

        var parent = node.parent;
        var pp     = node;

        return this._rebalanceRemove(parent, pp)
          .then(() => {
            if (node.parent) {
              if (node.parent.left === node) node.parent.left  = null;
              else                           node.parent.right = null;
            }

            if (node === this._root) this._root = null;

            this._size--;
            return Promise.resolve(returnValue);
          });
      });
  }

  /**
   * Bulk-load items
   * @param  {Array<Key>}  keys
   * @param  {Array<Value>}  [values]
   * @return {AVLTree}
   */
  load(keys = [], values = []) {
    if (this._countCompareCalls) {
      this._compareCallsCounter = 0;
    }
    if (!Array.isArray(keys)) return this;

    const pairs = [];
    keys.forEach((k, i) => pairs.push({ k, v: values[i] }));

    return Promise.each(pairs, p => this._insert(p.k, p.v))
      .then(() => this);
  }


  /**
   * Returns true if the tree is balanced
   * @return {boolean}
   */
  isBalanced() {
    return isBalanced(this._root);
  }


  /**
   * String representation of the tree - primitive horizontal print-out
   * @param  {Function(Node):string} [printNode]
   * @return {string}
   */
  toString (printNode) {
    return print(this._root, printNode);
  }
}

AVLTree.default = AVLTree;

export default AVLTree;
//# sourceMappingURL=avl-promise.es6.js.map

const Benchmark = require('benchmark');
const Tree      = require('avl');
const PTree     = require('../dist/avl-promise');
const FRB       = require('functional-red-black-tree');
const RBTree    = require('bintrees').RBTree;
const Promise   = require('bluebird');

require('google-closure-library');
goog.require('goog.structs.AvlTree');


const N = 1000;
const rvalues = new Array(N).fill(0).map((n, i) => Math.floor(Math.random() * N));
const values = new Array(N).fill(0).map((n, i) => i);

const options = {
  onStart (event) { console.log(this.name); },
  onError (event) { console.log(event.target.error); },
  onCycle (event) { console.log(String(event.target)); },
  onComplete() {
    console.log('- Fastest is ' + this.filter('fastest').map('name') + '\n');
  }
};

const prefilledAVL = new Tree();
rvalues.forEach((v) => prefilledAVL.insert(v));

const prefilledRB = new RBTree((a, b) => a - b);
rvalues.forEach((v) => prefilledRB.insert(v));

let prefilledFRB = new FRB();
rvalues.forEach((v) => { prefilledFRB = prefilledFRB.insert(v); });

const prefilledGCAVL = new goog.structs.AvlTree((a, b) => a - b);
rvalues.forEach((v) => prefilledGCAVL.add(v));

const prefilledPAVL = new PTree((a, b) => Promise.resolve(a - b));
Promise.each(rvalues, k => prefilledPAVL.insert(k))
  .then(() => new Promise((resolve, reject) => {
    new Benchmark.Suite(`Insert (x${N})`, options)
      .add('Bintrees', () => {
        let rb = new RBTree((a, b) => a - b);
        for (let i = 0; i < N; i++) rb.insert(rvalues[i]);
      })
      .add('Functional red black tree', () => {
        let frb = new FRB();
        for (let i = 0; i < N; i++) frb = frb.insert(rvalues[i]);
      })
      .add('Google Closure library AVL', () => {
        let gcavl = new goog.structs.AvlTree((a, b) => a - b);
        for (let i = 0; i < N; i++) gcavl.add(rvalues[i]);
      })
      .add('AVL (sync version)', () => {
        const tree = new Tree();
        for (let i = 0; i < N; i++) tree.insert(rvalues[i]);
      })
      .add('AVL Promise (current)', {
        defer: true,
        fn: (deferred) => {
          const tree = new PTree();
          Promise.each(rvalues, k => tree.insert(k))
            .then(() => deferred.resolve());
        }
      })
      .on('complete', () => resolve())
      .run();
  }))
  .then(() => new Promise((resolve, reject) => {
    new Benchmark.Suite(`Random read (x${N})`, options)
      .add('Bintrees', () => {
        for (let i = N - 1; i; i--) prefilledRB.find(rvalues[i]);
      })
      .add('Functional red black tree', () => {
        for (let i = N - 1; i; i--) prefilledFRB.get(rvalues[i]);
      })
      .add('Google Closure library AVL', () => {
        for (let i = 0; i < N; i++) prefilledGCAVL.inOrderTraverse((v) => v === rvalues[i]);
      })
      .add('AVL (sync version)', () => {
        for (let i = N - 1; i; i--) prefilledAVL.find(rvalues[i]);
      })
      .add('AVL Promise (current)', {
        defer: true,
        fn: (deferred) => {
          const tree = new PTree();
          Promise.each(rvalues, k => tree.find(k))
            .then(() => deferred.resolve());
        }
      })
      .on('complete', () => resolve())
      .run();
  }))
  .then(() => new Promise((resolve, reject) => {
    new Benchmark.Suite(`Remove (x${N})`, options)
      .add('Bintrees', () => {
        for (let i = 0; i < N; i++) prefilledRB.remove(rvalues[i]);
      })
      .add('Functional red black tree', () => {
        for (let i = 0; i < N; i++) prefilledFRB = prefilledFRB.remove(rvalues[i]);
      })
      .add('Google Closure library AVL', () => {
        for (let i = 0; i < N; i++) prefilledGCAVL.remove(rvalues[i]);
      })
      .add('AVL (sync version)', () => {
        for (let i = N - 1; i; i--) prefilledAVL.remove(values[i]);
      })
      .add('AVL Promise (current)', {
        defer: true,
        fn: (deferred) => {
          const tree = new PTree();
          Promise.each(rvalues, k => tree.remove(k))
            .then(() => deferred.resolve());
        }
      })
      .on('complete', () => resolve())
      .run();
  }));

import config from './rollup.config';
import buble  from 'rollup-plugin-buble';

config.format     = 'umd';
config.dest       = 'dist/avl-promise.js';
config.moduleName = 'AVLTree';
config.plugins    = [ buble() ];

config.external   = [ 'mocha', 'chai', 'bluebird', 'chai-as-promised' ];
config.globals    = {
  'bluebird': 'Promise'
};

export default config;

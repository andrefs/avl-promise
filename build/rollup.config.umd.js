import config from './rollup.config';
import buble  from 'rollup-plugin-buble';

config.format     = 'umd';
config.dest       = 'dist/avl-promise.js';
config.moduleName = 'AVLTree';
config.plugins    = [ buble() ];

export default config;

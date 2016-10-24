/**
 * Created by xuhua on 2016/10/20.
 */
'use strict'

const nodeResolve =require('rollup-plugin-node-resolve')
const rollup = require('rollup')
const buble = require('rollup-plugin-buble')
const cjs = require('rollup-plugin-commonjs')
const uglify = require('rollup-plugin-uglify')

rollup.rollup({
  entry: './src/index.js',
  external: [
    'lodash'
  ],
  plugins: [cjs(), nodeResolve({ jsnext: true, main: true }), buble(), uglify()],
}).then( function ( bundle ) {
  bundle.write({
    format: 'umd',
    globals: {
      lodash: '_'
    },
    moduleName: 'VirtualDom',
    dest: 'dist/virtual-dom.js'
  })
  console.log('success')
})

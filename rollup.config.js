/**
 * Created by xuhua on 2016/10/20.
 */
'use strict'

const rollup = require('rollup')
const buble = require('rollup-plugin-buble')
const cjs = require('rollup-plugin-commonjs')


rollup.rollup({
  entry: './src/index.js',
  external: [
    'lodash'
  ],
  plugins: [cjs(), buble()],
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

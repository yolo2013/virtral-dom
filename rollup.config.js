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
  console.log(1)
  bundle.write({
    format: 'umd',
    globals: {
      lodash: '_'
    },
    moduleName: 'VirtualDom',
    dest: 'examples/bundle.js'
  })
})

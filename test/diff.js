/**
 * Created by xuhua on 2016/10/19.
 */

import diff from '../src/diff/index'
import VNode from '../src/vnode'
import { expect } from 'chai'
fixture `Getting Start`

test('diff', async t => {
  let node3 = new VNode('div', {
    className: 'node3'
  }, [], 'node3')

  let node4 = new VNode('div', {
    className: 'node4'
  }, [], 'node4')

  let node5 = new VNode('div', {
    className: 'node5'
  }, [], 'node5')

  let freeNode1 = new VNode('div')
  let freeNode2 = new VNode('div', {
    className: 'new-no-key'
  })

  let node1 = new VNode('div', {
    className: 'node1'
  }, [node4, freeNode2], 'node1')

  let node2 = new VNode('div', {
    className: 'node2'
  }, [freeNode2], 'node1')

  const result = diff(node1, node2)

  expect(result.oldNode).to.equal(node1)
})


// export default function test () {
//
//
//
// }
//
// test()

/**
 * Created by xuhua on 2016/10/19.
 */
import recorder from '../src/diff/recorder'
import VNode from '../src/vnode'

export default function test () {
  let node1 = new VNode('div', {
    className: 'node1'
  }, [], 'node1')

  let node2 = new VNode('div', {
    className: 'node2'
  }, [], 'node2')

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

  const oldChildren = [node1, node2, node3, freeNode1, node4, node5]

  const newChildren = [node5, freeNode2, node2]

  const result = recorder(oldChildren, newChildren)
}

test()
// export default test("record with two children", function (assert) {

//   assert.equal(result.moves.removes, 3)
//
//   assert.end()
// })

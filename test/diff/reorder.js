/**
 * Created by xuhua on 2016/10/22.
 */
import reorder from '../../src/diff/reorder'
import VNode from '../../src/vnode'
import { expect } from 'chai'

fixture `Diff`

// 这个函数是整个比对过程中最复杂的模块
test('reorder', async t => {
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

  let oldChildren = [node1, node2, node3, freeNode1, node4, node5]

  let newChildren = [node5, freeNode2, node2]

  let diff = reorder(oldChildren, newChildren)

  expect(diff.children.length).to.equal(6)
  expect(diff.children).to.deep.equal([null, node2, null, freeNode2, null, node5])

  expect(diff.moves.inserts.length).to.equal(2)
  expect(diff.moves.inserts[0]).to.deep.equal({
    key: 'node5',
    to: 0
  })
  expect(diff.moves.inserts[1]).to.deep.equal({
    key: 'node2',
    to: 2
  })

  // 一定要明确，流程是，先完成remove，再统一执行insert
  expect(diff.moves.removes.length).to.equal(5)
  expect(diff.moves.removes[0]).to.deep.equal({
    from: 0,
    key: null
  })
  expect(diff.moves.removes[1]).to.deep.equal({
    from: 0,
    key: 'node2'
  })
  expect(diff.moves.removes[2]).to.deep.equal({
    from: 0,
    key: null
  })
  expect(diff.moves.removes[3]).to.deep.equal({
    from: 1,
    key: null
  })
  expect(diff.moves.removes[4]).to.deep.equal({
    from: 1,
    key: 'node5'
  })
})

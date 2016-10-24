/**
 * Created by xuhua on 2016/10/22.
 */
import diff from '../../src/diff'
import VNode from '../../src/vnode'
import VPatch, {PATCH_TYPES} from '../../src/vpatch'
import {expect} from 'chai'

fixture `Diff`

function vnodeMaker(text, color, children) {
  return new VNode('div', {
    style: {
      color: color
    },
    textContent: text
  }, children)
}

test('diff', async t => {

  let node1 = new VNode('input', {
    className: 'node1',
    type: 'text',
    value: '是谁在敲打我窗'
  }, [], 'text1')

  let node2 = new VNode('div', {
    className: 'node1',
    textContent: '一个短篇'
  }, [], 'node2')

  const oldNode = vnodeMaker('旧文', '#000', [node1, node2])

  const newNode = vnodeMaker('新文', 'red', [node2])
  const patches = diff(oldNode, newNode)

  expect(patches.oldNode).to.equal(oldNode)
  expect(patches[0]).to.be.an.instanceOf(VPatch)
  expect(patches[1]).to.be.an.instanceOf(VPatch)

  // 首先是属性修改
  expect(patches[0]).to.deep.equal({
    type: PATCH_TYPES.PROPS,
    patch: {
      style: {
        color: 'red'
      },
      textContent: '新文'
    },
    vnode: oldNode
  })

  // 其次有子节点删除
  expect(patches[1]).to.deep.equal({
    type: PATCH_TYPES.REMOVE,
    patch: null,
    vnode: node1
  })

})

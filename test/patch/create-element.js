/**
 * Created by xuhua on 2016/10/22.
 */
import VNode from '../../src/vnode'
import createElement from '../../src/patch/create-element'
import { expect } from 'chai'

fixture `Patch`

test('createElement', async t => {
  let node1 = new VNode('input', {
    className: 'node1',
    type: 'text',
    value: '是谁在敲打我窗'
  }, [], 'text1')

  let node2 = new VNode('div', {
    className: 'node1',
  }, [node1], 'node2')

  let element = createElement(node2)

  expect(element instanceof HTMLElement).to.be.true
  expect(element.childNodes.length).to.equal(1)
  expect(element.childNodes[0].className).to.equal('node1')
})

/**
 * Created by xuhua on 2016/10/22.
 */

import VNode from '../src/vnode'
import { expect } from 'chai'
fixture `VNode`

test('VNode', async t => {
  // 只有标签和属性的
  let node = new VNode('a', {
    href: 'http://www.apple.com',
    style: {
      color: 'red'
    },
    textContent: '苹果官网'
  }, [], 'unique-key')

  expect(node.props.textContent).to.equal('苹果官网')
  expect(node.props.style).to.deep.equal({
    color: 'red'
  })
  expect(node.props.href).to.equal('http://www.apple.com')
  expect(node.children).to.be.empty
  expect(node.key).to.equal('unique-key')
})

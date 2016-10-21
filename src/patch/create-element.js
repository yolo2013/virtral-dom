/**
 * Created by xuhua on 2016/10/17.
 */

import _ from 'lodash'
import applyProps from './apply-props'

export default function createElement(vnode) {

  const doc = document

  let node = vnode.ele = vnode.namespace
    ? doc.createElementNS(vnode.namespace, vnode.tag)
    : doc.createElement(vnode.tag)

  const props = vnode.props

  props && applyProps(node, props)

  _.each(vnode.children, child => {
    let childNode = createElement(child)

    if(childNode) {
      node.appendChild(childNode)
    }
  })

  return node
}


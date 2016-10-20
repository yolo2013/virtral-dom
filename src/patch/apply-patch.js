/**
 * Created by xuhua on 2016/10/20.
 */
import VPatch, {PATCH_TYPES} from '../vpatch'
import createElement from './create-element'
import applyProps from './apply-props'

export default function applyPatch(node, vpatch) {
  var patch = vpatch.patch
  var vnode = vpatch.vnode

  switch (vpatch.type) {
    case PATCH_TYPES.INSERT:
      return insertNode(node, vnode)
    case PATCH_TYPES.REMOVE:
      return removeNode(node)
    case PATCH_TYPES.REPLACE:
    case PATCH_TYPES.ORDER:
    case PATCH_TYPES.PROPS:
      return applyProps(node, patch)
    case PATCH_TYPES.TEXT:
    default:
      return node
  }
}

function insertNode(parentNode, vnode) {
  const newNode = createElement(vnode)

  if (parentNode) {
    parentNode.appendChild(newNode)
  }

  return parentNode
}

function removeNode(node) {
  const parentNode = node.parentNode

  if(parentNode) {
    parentNode.removeChild(node)
  }

  return null
}

import VPatch, {PATCH_TYPES} from '../vpatch'
import createElement from './create-element'
import applyProps from './apply-props'
import each from 'lodash/each'

export default function applyPatch(node, vpatch) {
  var patch = vpatch.patch
  var vnode = vpatch.vnode

  switch (vpatch.type) {
    case PATCH_TYPES.INSERT:
      return insertNode(node, patch)
    case PATCH_TYPES.REMOVE:
      return removeNode(vnode.ele)
    case PATCH_TYPES.REPLACE:
    case PATCH_TYPES.ORDER:
      reorderChildren(node, patch)
    case PATCH_TYPES.PROPS:
      applyProps(node, patch)
      return node
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

// 子节点重新排序
function reorderChildren(node, moves) {
  let childNodes = node.childNodes

  let keyMap = {}
  let tempNode

  each(moves.removes, remove => {
    tempNode = childNodes[remove.from]
    if(remove.key) {
      keyMap[remove.key] = tempNode
    }
    node.removeChild(tempNode)
  })

  let length = childNodes.length
  each(moves.inserts, insert => {
    tempNode = keyMap[insert.key]

    // 如果当前to大于子节点长度，正常现象，因为未必所以其他节点都已经添加进去了，
    // 则把该节点加至最后
    node.insertBefore(tempNode, insert.to >= length++ ? null : childNodes[insert.to])
  })
}

/**
 * Created by xuhua on 2016/10/17.
 */
import _ from 'lodash'
import VPatch, {PATCH_TYPES} from '../vpatch'
import recorder from './recorder'
import diffProps from './diff-props'

export default function diff(oldNode, newNode) {
  let patch = {oldNode}

  walk(oldNode, newNode, patch, 0)

  return patch
}

function walk(oldVNode, newVNode, patch, index) {
  if (oldVNode === newVNode) {
    return
  }

  // 第一次进入时，apply为undefined
  let apply = patch[index]


  if(!newVNode) {
    // 节点被移除，不用单独加操作，在进行diff的时候会将这部分加进去
    apply = appendPatch(apply, new VPatch(PATCH_TYPES.REMOVE, oldVNode, newVNode))
  } else  if (oldVNode.tagName === newVNode.tagName
    && oldVNode.namespace === newVNode.namespace
    && oldVNode.key === newVNode.key) {
    // 这个条件满足，表明是同一节点的更新

    let propsDiff = diffProps(oldVNode.props, newVNode.props)

    // 如果存在不同
    if (propsDiff && !_.isEmpty(propsDiff)) {
      apply = appendPatch(apply, new VPatch(PATCH_TYPES.PROPS, oldVNode, propsDiff))
    }

    apply = diffChildren(oldVNode, newVNode, patch, apply, index)


  } else {
    // 如果不是同一节点的更新，直接进行节点的替换
    apply = appendPatch(apply, new VPatch(PATCH_TYPES.REPLACE, oldVNode, newVNode))
  }

  if (apply) {
    patch[index] = apply
  }
}

// 子节点比对
function diffChildren(oldVNode, newVNode, patch, apply, index) {
  let oldChildren = oldVNode.children

  let orderedSet = recorder(oldChildren, newVNode.children)
  let newChildren = orderedSet.children

  let len = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < len; i++) {
    let leftNode = oldChildren[i]
    let rightNode = newChildren[i]
    index++

    if (!leftNode) {
      if (rightNode) {
        apply = appendPatch(apply, new VPatch(PATCH_TYPES.INSERT, null, rightNode))
      }
    } else {
      walk(leftNode, rightNode, patch, index)
    }

    // 在上面的递归之后，节点的所有子节点都处理完成，index需要递增
    if (leftNode && leftNode.count) {
      index += leftNode.count
    }
  }

  // 节点有移动或新增
  if (orderedSet.moves) {
    apply = appendPatch(apply, new VPatch(
      PATCH_TYPES.ORDER,
      oldVNode,
      orderedSet.moves
    ))
  }

  return apply
}

function appendPatch(apply, patch) {
  if (apply) {
    if (_.isArray(apply)) {
      apply.push(patch)
    } else {
      apply = [apply, patch]
    }

    return apply
  } else {
    return patch
  }
}

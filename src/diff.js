/**
 * Created by xuhua on 2016/10/17.
 */
import _ from 'lodash'
import VPatch, {PATCH_TYPES} from './vpatch'

export default function diff(oldNode, newNode) {
  let patch = {oldNode}

  walk(oldNode, newNode, patch, 0)
}

function walk(oldVNode, newVNode, patch, index) {
  if (oldVNode === newVNode) {
    return
  }

  // 第一次进入时，apply为undefined
  let apply = patch[index]

  // 这个条件满足，表明是同一节点的更新
  if (oldVNode.tagName === newVNode.tagName
    && oldVNode.namespace === newVNode.namespace
    && oldVNode.key === newVNode.key) {

    let propsDiff = diffProps(oldVNode.props, newVNode.props)

    // 如果存在不同
    if (propsDiff && !_.isEmpty(propsDiff)) {
      appendPatch(apply, new VPatch(PATCH_TYPES.PROPS, oldVNode, propsDiff))
    }

    apply = diffChildren(oldVNode, newVNode, patch, apply, index)


  } else {
    // 如果不是同一节点的更新，直接进行节点的替换
    appendPatch(apply, new VPatch(PATCH_TYPES.REPLACE, oldVNode, newVNode))
  }

  if (apply) {
    if (apply) {
      patch[index] = apply
    }
  }
}

function diffChildren(oldVNode, newVNode, patch, apply, index) {
  let oldChildren = oldVNode.children.length
  let newChildren = newVNode.children.length

}

// 在初始化每个 VNode 时，可以传入 key 作为节点标志，
// 在实际的操作中，VNode 顺序和排列可能有比较大的变动。
// 如果直接将新旧数组进行逐一比对，会有很多不一致性，
// 这里就是为了将定义了 key 的 VNode 位置固定
// 以节约性能
function recorder(oldChildren, newChildren) {

  // 因为此函数的所有处理都基于节点中的key字段属性值，
  // 如果有任何一个数组中所有节点都没有key
  // 那么直接返回即可
  const newChildIndex = keyIndex(newChildren)
  const {keys: newKeys, free: newFree} = newChildIndex

  if (newFree.length === newChildren.length) {
    return {
      children: newChildren,
      moves: null
    }
  }

  const oldChildIndex = keyIndex(oldChildren)
  const {keys: oldKeys, free: oldFree} = oldChildIndex

  if (oldFree.length === oldChildren.length) {
    return {
      children: newChildren,
      moves: null
    }
  }

  // 由此开始处理

  // 用于存放处理结果
  const resultChildren = []

  // 删除的节点数量
  let deletedIndex = 0
  // 无key的节点索引
  let freeIndex = 0
  // 无key的节点数量
  let freeCount = newFree.length


  // 首先遍历旧节点
  _.each(oldChildren, (oldChild, index) => {
    let itemIndex

    if (oldChild.key) {
      // 如果有key
      // 在新节点数组中，是否有该key
      // 如果有，在结果数组中，添加新数组中该key对应的VNode
      if (newKeys.hasOwnProperty(oldChild.key)) {
        itemIndex = newKeys[oldChild.key]
        resultChildren.push(newChildren[itemIndex])
      } else {
        // 如果没有，表明该节点已被删除，结果数组中放入 null 作为占位
        deletedIndex++
        resultChildren.push(null)
      }
    } else {
      // 如果没有key
      // 首先判断，freeIndex 是否小于 newFree 的数量
      // 如果小于，在结果数组中，增加newChildren中无key对应的VNode
      if (freeIndex < newFree.length) {
        itemIndex = newFree[freeIndex++]
        resultChildren.push(newChildren[itemIndex])
      } else {
        // 如果不小于，说明在 oldChildren 中没有对应的节点
        // 即，在newChildren中，存在节点被删除，删除计数增加，
        // ，结果数组中push null 作为占位
        deletedIndex++
        resultChildren.push(null)
      }
    }
  })

  // 最后一个无key节点的索引
  let lastFreeIndex =
    freeIndex >= freeCount
      ? newChildren.length
      : newFree[freeIndex]

  // 遍历新节点
  // 很多情况下，这个循环体的判断条件都不满足
  // 以 [a, b, c] => [d, b, a] 作为示例来演示
  _.each(newChildren, (newChild, index) => {
    if (newChild.key) {
      // 如果有key

      // 如果这个key在旧节点中也存在，在前面旧节点的循环中已经处理，不必处理
      // 否则，将其添加到结果数组
      if (!oldKeys.hasOwnProperty(newChild.key)) {
        resultChildren.push(newChild)
      }
    } else if (index >= lastFreeIndex) {
      // 不存在key的节点，且 index 不小于最后一个无key节点的索引
      resultChildren.push(newChild)
    }
  })

  // 到这里为止，resultChildren，应该是长度大于实际新节点数
  // 被删除的节点用null填充
  // 在旧节点长度之后的数据，是新节点中存在的key，但旧节点中不存在
  // 以及，新节点中无key节点比旧节点多出的那部分
  // 以示例的情况，就是[a, d, b]


  // 这里建立拷贝的原因是，在接下来的处理中，会将数组中的某些元素移除，
  // 而不影响到resultChildren
  const simulate = resultChildren.slice()

  // 备份遍历的索引值
  let simulateIndex = 0
  const removes = []
  const inserts = []
  let simulateItem

  // 在循环过程中，会存在需要跳过的情况，所以使用原生的for循环
  // 另外，这里的遍历索引值，在某些情况下不需要执行递增，所以将++操作放在循环体内
  // 不管怎样，这里需要遍历新节点数组
  for (let i = 0; i < newChildren.length;) {
    let newChild = newChildren[i]

    simulateItem = simulate[simulateIndex]

    // 这里将连续的null节点移除
    while (simulateItem === null && simulate.length) {
      // 在simulate数组中移除该位置，并重新为simulateItem赋值
      removes.push(remove(simulate, simulateIndex, null))
      simulateItem = simulate[simulateIndex]
    }

    // 结果数组中，该索引位置为null，或者key不对应
    if (!simulateItem || simulateItem.key !== newChild.key) {

      // 如果实际新节点中，这个位置有key
      if (newChild.key) {

        // 并且处理结果中，这个位置也有key，那么这里就是两个key不相等
        // 就是在这个位置，节点有变动，那么要判断是添加了新节点还是删除了其它节点引起的
        if (simulateItem && simulateItem.key) {

          // 如果新增的节点
          if (newKeys[simulateItem.key] !== i + 1) {
            removes.push(remove(simulate, simulateIndex, simulateItem.key))
            simulateItem = simulate[simulateIndex]

            // 如果移除过后，仍然不匹配，则添加
            if (!simulateItem || simulateItem.key !== newChild.key) {
              inserts.push({
                key: newChild.key,
                to: i
              })
            } else {
              // 如果匹配，则跳过
              simulateIndex++
            }

          } else {
            inserts.push({
              key: newChild.key,
              to: i
            })
          }

        } else {
          inserts.push({
            key: newChild.key,
            to: i
          })
        }
        i++
      } else if (simulateItem && simulateItem.key) {
        // 结果数组中这个位置是有key的节点，而在新节点数组中这个位置没有key
        // 将结果数组中该位置移除
        // 进入下一次循环，因为数组长度-1，这里i不需要+1
        removes.push(remove(simulate, simulateIndex, simulateItem.key))
      }
    } else {
      // simulateItem存在，且key都不存在或者key相同，则跳过
      simulateIndex++
      i++
    }
  }

  while (simulateIndex < simulate.length) {
    simulateItem = simulate[simulateIndex]
    removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
  }

  // 如果所有的移动，都是已删除，并且没有新增项
  if (removes.length === deletedIndex && !inserts.length) {
    return {
      children: resultChildren,
      moves: null
    }
  }

  return {
    children: resultChildren,
    moves: {
      removes: removes,
      inserts: inserts
    }
  }

}

// 获取一个子节点集合中，固定了key的索引和不固定的索引
function keyIndex(children) {
  const keys = {}
  const free = []

  _.each(children, (child, index) => {
    child.key
      ? (keys[child.key] = index)
      : free.push(index)
  })

  return {keys, free}
}

function remove(arr, index, key) {
  arr.splice(index, 1)

  return {
    from: index,
    key: key
  }
}

// 两个属性差异比较
function diffProps(oldProps, newProps) {

  let diff = {}

  for (let key in oldProps) {
    if (oldProps.hasOwnProperty(key)) {
      // 如果新属性中没有该属性，则直接置为undefined
      if (!newProps.has(key)) {
        diff[key] = void 0
      }

      const newValue = newProps[key]
      const oldValue = oldProps[key]

      if (newValue === oldValue) {
        // 完全相等
        continue
      } else if (_.isObject(newValue) && _.isObject(oldValue)) {
        // 两个值都是对象

        // 原型不同
        if (getPrototype(newValue) !== getPrototype(oldValue)) {
          diff[key] = newValue
        } else {
          let objectDiff = diffProps(oldValue, newValue)

          if (objectDiff) {
            diff[key] = objectDiff
          }
        }
      } else {
        // 普通数据类型
        diff[key] = newValue
      }
    }
  }

  _.forIn(newProps, (newValue, key) => {
    // 如果旧属性中没有该属性，则进行添加
    if (!oldProps.has(key)) {
      diff[key] = newValue
    }
  })

  return diff
}

function appendPatch(apply, patch) {
  if (apply) {
    if (isArray(apply)) {
      apply.push(patch)
    } else {
      apply = [apply, patch]
    }

    return apply
  } else {
    return patch
  }
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

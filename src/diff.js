/**
 * Created by xuhua on 2016/10/17.
 */


export default function diff(oldNode, newNode) {

}

function walk(oldVNode, newVNode, patch, index) {
  if (oldVNode === newVNode) {
    return
  }


  // 这个条件满足，表明是同一节点的更新
  if (oldVNode.tagName === newVNode.tagName
    && oldVNode.namespace === newVNode.namespace
    && oldVNode.key === newVNode.key) {

    let propsDiff = diffProps(oldVNode.props, newVNode.props)

    // 如果存在不同
    if (propsDiff && !_.isEmpty(propsDiff)) {

    }
  }
}

function diffChildren(oldVNode, newVNode) {
  let oldChildren = oldVNode.children.length
  let newChildren = newVNode.children.length
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

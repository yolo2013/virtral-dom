import has from 'lodash/has'
import isObject from 'lodash/isObject'
import forIn from 'lodash/forIn'

// 两个属性差异比较
export default function diffProps(oldProps, newProps) {

  let diff = {}

  for (let key in oldProps) {
    if (oldProps.hasOwnProperty(key)) {
      // 如果新属性中没有该属性，则直接置为undefined
      if (!has(newProps, key)) {
        diff[key] = void 0
      }

      const newValue = newProps[key]
      const oldValue = oldProps[key]

      if (newValue === oldValue) {
        // 完全相等
        continue
      } else if (isObject(newValue) && isObject(oldValue)) {
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

  forIn(newProps, (newValue, key) => {
    // 如果旧属性中没有该属性，则进行添加
    if (!has(oldProps, key)) {
      diff[key] = newValue
    }
  })

  return diff
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

import isObject from 'lodash/isObject'
import forIn from 'lodash/forIn'
import isString from 'lodash/isString'

// 处理属性
export default function applyProps(node, props) {
  if (!isObject(props)) {
    console.log('属性必须是一个合法对象')
    return
  }
  forIn(props, (propValue, prop) => {
    if (propValue === undefined) {
      removeProp(node, prop)
    } else {
      setProp(node, prop, propValue)
    }
  })
}

// 设置属性
function setProp(node, key, value) {

  if (isObject(value)) {
    // attributes
    if (key === 'attributes') {
      forIn(value, (attrValue, attrName) => {
        if (attrValue === undefined) {
          node.removeAttribute(attrName)
        } else {
          // value 是对象
          node.setAttribute(attrName, attrValue)
        }
      })
    }

    // 样式属性
    if (key === 'style') {
      forIn(value, (styleValue, styleName) => {
        node[key][styleName] = styleValue || ''
      })
    }
  } else {
    node[key] = value
  }
}

// 移除属性
function removeProp(node, prop) {
  if (!prop || isString(prop)) {
    console.log('移除属性需要合法的属性名')
    return
  }
}

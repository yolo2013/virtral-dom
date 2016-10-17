/**
 * Created by xuhua on 2016/10/17.
 */

import _ from 'lodash'

export default function createElement(vnode) {
  const doc = document

  vnode.ele = vnode.namespace
    ? doc.createElementNS(vnode.namespace, vnode.tag)
    : doc.createElement(vnode.tag)
}

// 处理属性
function applyProps(vnode, props) {
  const ele = vnode.ele

  if (_.isObject(props)) {
    console.log('属性必须是一个合法对象')
    return
  }

  _.forIn(props, (propValue, prop) => {
    if (propValue === undefined) {
      removeProp(vnode, prop)
    } else {
      setProp(vnode, prop, propValue)
    }
  })
}

// 设置属性
function setProp(vnode, key, value) {
  const ele = vnode.ele

  if (_.isObject(value)) {
    // attributes
    if (key === 'attributes') {
      _.forIn(value, (attrValue, attrName) => {
        if (attrValue === undefined) {
          ele.removeAttribute(attrName)
        } else {
          // value 是对象
          ele.setAttribute(attrName, attrValue)
        }
      })

    }

    // 样式属性
    if (key === 'style') {
      _.forIn(value, (styleValue, styleName) => {
        ele[key][styleName] = styleValue || ''
      })
    }
  } else {
    ele[key] = value
  }
}

// 移除属性
function removeProp(vnode, prop) {
  const ele = vnode.ele

  if (!prop || _.isString(prop)) {
    console.log('移除属性需要合法的属性名')
    return
  }


}

import isArray from 'lodash/isArray'
import each from 'lodash/each'

export default class VNode {

  /**
   *
   * @param tag 标签类型
   * @param props 节点属性
   * @param children 子节点
   */
  constructor(tag, props, children, key, namespace) {
    this.tag = tag
    this.props = props || {}
    this.children = children || []

    this.key = key ? key : null
    this.namespace = namespace || null

    let count = 0

    if (isArray(this.children)) {
      each(this.children, child => {

        // 子节点是 VNode 对象
        if (child instanceof VNode) {
          count += child.count
        }
      })
    }

    this.count = count

    // 特殊标识
    this._isVNode = true
  }
}

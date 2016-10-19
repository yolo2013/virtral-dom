/**
 * Created by xuhua on 2016/10/18.
 */

export default class VPatch {

  /**
   * Patch构造函数
   * @param type 类型
   * @param vnode 作用的节点
   * @param patch 具体需要执行的patch（就是修改的内容）
   */
  constructor(type, vnode, patch) {
    this.type = type
    this.vnode = vnode
    this.patch = patch
  }
}

export const PATCH_TYPES = {
  REPLACE: 0,
  INSERT: 1,
  ORDER: 2,
  REMOVE: 3,
  PROPS: 4,
  TEXT: 5
}

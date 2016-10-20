/**
 * Created by xuhua on 2016/10/20.
 */
import VNode from './vnode'
import diff from './diff'
import createElement from './patch/create-element'
import patch from './patch/patch'

export default {
  VNode,
  diff,
  createElement,
  patch
}

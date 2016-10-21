(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash')) :
  typeof define === 'function' && define.amd ? define(['lodash'], factory) :
  (global.VirtualDom = factory(global._));
}(this, (function (_$1) { 'use strict';

_$1 = 'default' in _$1 ? _$1['default'] : _$1;

/**
 * Created by xuhua on 2016/10/17.
 */

var VNode = function VNode(tag, props, children, key, namespace) {
  this.tag = tag;
  this.props = props || {};
  this.children = children || [];

  this.key = key ? key : null;
  this.namespace = namespace || null;

  var count = 0;

  if (_$1.isArray(this.children)) {
    _$1.each(this.children, function (child) {

      // 子节点是 VNode 对象
      if (child instanceof VNode) {
        count += child.count;
      }
    });
  }

  this.count = count;

  // 特殊标识
  this._isVNode = true;
};

/**
 * Created by xuhua on 2016/10/18.
 */

var VPatch = function VPatch(type, vnode, patch) {
  this.type = type;
  this.vnode = vnode;
  this.patch = patch;
};

var PATCH_TYPES = {
  REPLACE: 0,
  INSERT: 1,
  ORDER: 2,
  REMOVE: 3,
  PROPS: 4,
  TEXT: 5
};

// 在初始化每个 VNode 时，可以传入 key 作为节点标志，
// 在实际的操作中，VNode 顺序和排列可能有比较大的变动。
// 如果直接将新旧数组进行逐一比对，会有很多不一致性，
// 这里就是为了将定义了 key 的 VNode 位置固定
// 以节约性能
function recorder(oldChildren, newChildren) {
  // 因为此函数的所有处理都基于节点中的key字段属性值，
  // 如果有任何一个数组中所有节点都没有key
  // 那么直接返回即可
  var newChildIndex = keyIndex(newChildren);
  var newKeys = newChildIndex.keys;
  var newFree = newChildIndex.free;

  if (newFree.length === newChildren.length) {
    return {
      children: newChildren,
      moves: null
    }
  }

  var oldChildIndex = keyIndex(oldChildren);
  var oldKeys = oldChildIndex.keys;
  var oldFree = oldChildIndex.free;

  if (oldFree.length === oldChildren.length) {
    return {
      children: newChildren,
      moves: null
    }
  }

  // 由此开始处理

  // 用于存放处理结果
  var resultChildren = [];

  // 删除的节点数量
  var deletedIndex = 0;
  // 无key的节点索引
  var freeIndex = 0;
  // 无key的节点数量
  var freeCount = newFree.length;

  // 首先遍历旧节点
  _$1.each(oldChildren, function (oldChild, index) {
    var itemIndex;

    if (oldChild.key) {
      // 如果有key
      // 在新节点数组中，是否有该key
      // 如果有，在结果数组中，添加新数组中该key对应的VNode
      if (newKeys.hasOwnProperty(oldChild.key)) {
        itemIndex = newKeys[oldChild.key];
        resultChildren.push(newChildren[itemIndex]);
      } else {
        // 如果没有，表明该节点已被删除，结果数组中放入 null 作为占位
        deletedIndex++;
        resultChildren.push(null);
      }
    } else {
      // 如果没有key
      // 首先判断，freeIndex 是否小于 newFree 的数量
      // 如果小于，在结果数组中，增加newChildren中无key对应的VNode
      if (freeIndex < newFree.length) {
        itemIndex = newFree[freeIndex++];
        resultChildren.push(newChildren[itemIndex]);
      } else {
        // 如果不小于，说明在 oldChildren 中没有对应的节点
        // 即，在newChildren中，存在节点被删除，删除计数增加，
        // ，结果数组中push null 作为占位
        deletedIndex++;
        resultChildren.push(null);
      }
    }
  });

  // 最后一个无key节点的索引
  var lastFreeIndex =
    freeIndex >= freeCount
      ? newChildren.length
      : newFree[freeIndex];

  // 遍历新节点
  // 很多情况下，这个循环体的判断条件都不满足
  // 以 [a, b, c] => [d, b, a] 作为示例
  _$1.each(newChildren, function (newChild, index) {
    if (newChild.key) {
      // 如果有key

      // 如果这个key在旧节点中也存在，在前面旧节点的循环中已经处理，不必处理
      // 否则，将其添加到结果数组
      if (!oldKeys.hasOwnProperty(newChild.key)) {
        resultChildren.push(newChild);
      }
    } else if (index >= lastFreeIndex) {
      // 不存在key的节点，且 index 不小于最后一个无key节点的索引
      resultChildren.push(newChild);
    }
  });

  // 到这里为止，resultChildren，应该是长度大于实际新节点数
  // 被删除的节点用null填充
  // 在旧节点长度之后的数据，是新节点中存在的key，但旧节点中不存在
  // 以及，新节点中无key节点比旧节点多出的那部分
  // 以示例的情况，就是[a, d, b]


  // 这里建立拷贝的原因是，在接下来的处理中，会将数组中的某些元素移除，
  // 而不影响到resultChildren
  var simulate = resultChildren.slice();

  // 备份遍历的索引值
  var simulateIndex = 0;
  var removes = [];
  var inserts = [];
  var simulateItem;

  // 在循环过程中，会存在需要跳过的情况，所以使用原生的for循环
  // 另外，这里的遍历索引值，在某些情况下不需要执行递增，所以将++操作放在循环体内
  // 不管怎样，这里需要遍历新节点数组
  for (var i = 0; i < newChildren.length;) {
    var newChild = newChildren[i];

    simulateItem = simulate[simulateIndex];

    // 这里将连续的null节点移除
    while (simulateItem === null && simulate.length) {
      // 在simulate数组中移除该位置，并重新为simulateItem赋值
      removes.push(remove(simulate, simulateIndex, null));
      simulateItem = simulate[simulateIndex];
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
            removes.push(remove(simulate, simulateIndex, simulateItem.key));
            simulateItem = simulate[simulateIndex];

            // 如果移除过后，仍然不匹配，则添加
            if (!simulateItem || simulateItem.key !== newChild.key) {
              inserts.push({
                key: newChild.key,
                to: i
              });
            } else {
              // 如果匹配，则跳过
              simulateIndex++;
            }

          } else {
            inserts.push({
              key: newChild.key,
              to: i
            });
          }

        } else {
          inserts.push({
            key: newChild.key,
            to: i
          });
        }
        i++;
      } else if (simulateItem && simulateItem.key) {
        // 结果数组中这个位置是有key的节点，而在新节点数组中这个位置没有key
        // 将结果数组中该位置移除
        // 进入下一次循环，因为数组长度-1，这里i不需要+1
        removes.push(remove(simulate, simulateIndex, simulateItem.key));
      }
    } else {
      // simulateItem存在，且key都不存在或者key相同，则跳过
      simulateIndex++;
      i++;
    }
  }

  while (simulateIndex < simulate.length) {
    simulateItem = simulate[simulateIndex];
    removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
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
  var keys = {};
  var free = [];

  _$1.each(children, function (child, index) {
    child.key
      ? (keys[child.key] = index)
      : free.push(index);
  });

  return {keys: keys, free: free}
}

function remove(arr, index, key) {
  arr.splice(index, 1);

  return {
    from: index,
    key: key
  }
}

// 两个属性差异比较
function diffProps(oldProps, newProps) {

  var diff = {};

  for (var key in oldProps) {
    if (oldProps.hasOwnProperty(key)) {
      // 如果新属性中没有该属性，则直接置为undefined
      if (!_$1.has(newProps, key)) {
        diff[key] = void 0;
      }

      var newValue = newProps[key];
      var oldValue = oldProps[key];

      if (newValue === oldValue) {
        // 完全相等
        continue
      } else if (_$1.isObject(newValue) && _$1.isObject(oldValue)) {
        // 两个值都是对象

        // 原型不同
        if (getPrototype(newValue) !== getPrototype(oldValue)) {
          diff[key] = newValue;
        } else {
          var objectDiff = diffProps(oldValue, newValue);

          if (objectDiff) {
            diff[key] = objectDiff;
          }
        }
      } else {
        // 普通数据类型
        diff[key] = newValue;
      }
    }
  }

  _$1.forIn(newProps, function (newValue, key) {
    // 如果旧属性中没有该属性，则进行添加
    if (!_$1.has(oldProps, key)) {
      diff[key] = newValue;
    }
  });

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

/**
 * Created by xuhua on 2016/10/17.
 */
function diff(oldNode, newNode) {
  var patch = {oldNode: oldNode};

  walk(oldNode, newNode, patch, 0);

  return patch
}

function walk(oldVNode, newVNode, patch, index) {
  if (oldVNode === newVNode) {
    return
  }

  // 第一次进入时，apply为undefined
  var apply = patch[index];


  if(!newVNode) {
    // 节点被移除，不用单独加操作，在进行diff的时候会将这部分加进去
    apply = appendPatch(apply, new VPatch(PATCH_TYPES.REMOVE, oldVNode, newVNode));
  } else  if (oldVNode.tagName === newVNode.tagName
    && oldVNode.namespace === newVNode.namespace
    && oldVNode.key === newVNode.key) {
    // 这个条件满足，表明是同一节点的更新

    var propsDiff = diffProps(oldVNode.props, newVNode.props);

    // 如果存在不同
    if (propsDiff && !_$1.isEmpty(propsDiff)) {
      apply = appendPatch(apply, new VPatch(PATCH_TYPES.PROPS, oldVNode, propsDiff));
    }

    apply = diffChildren(oldVNode, newVNode, patch, apply, index);


  } else {
    // 如果不是同一节点的更新，直接进行节点的替换
    apply = appendPatch(apply, new VPatch(PATCH_TYPES.REPLACE, oldVNode, newVNode));
  }

  if (apply) {
    patch[index] = apply;
  }
}

// 子节点比对
function diffChildren(oldVNode, newVNode, patch, apply, index) {
  var oldChildren = oldVNode.children;

  var orderedSet = recorder(oldChildren, newVNode.children);
  var newChildren = orderedSet.children;

  var len = Math.max(oldChildren.length, newChildren.length);

  for (var i = 0; i < len; i++) {
    var leftNode = oldChildren[i];
    var rightNode = newChildren[i];
    index++;

    if (!leftNode) {
      if (rightNode) {
        apply = appendPatch(apply, new VPatch(PATCH_TYPES.INSERT, null, rightNode));
      }
    } else {
      walk(leftNode, rightNode, patch, index);
    }

    // 在上面的递归之后，节点的所有子节点都处理完成，index需要递增
    if (leftNode && leftNode.count) {
      index += leftNode.count;
    }
  }

  // 节点有移动或新增
  if (orderedSet.moves) {
    apply = appendPatch(apply, new VPatch(
      PATCH_TYPES.ORDER,
      oldVNode,
      orderedSet.moves
    ));
  }

  return apply
}

function appendPatch(apply, patch) {
  if (apply) {
    if (_$1.isArray(apply)) {
      apply.push(patch);
    } else {
      apply = [apply, patch];
    }

    return apply
  } else {
    return patch
  }
}

// 处理属性
function applyProps(node, props) {
  if (!_.isObject(props)) {
    console.log('属性必须是一个合法对象');
    return
  }
  _.forIn(props, function (propValue, prop) {
    if (propValue === undefined) {
      removeProp(node, prop);
    } else {
      setProp(node, prop, propValue);
    }
  });
}

// 设置属性
function setProp(node, key, value) {

  if (_.isObject(value)) {
    // attributes
    if (key === 'attributes') {
      _.forIn(value, function (attrValue, attrName) {
        if (attrValue === undefined) {
          node.removeAttribute(attrName);
        } else {
          // value 是对象
          node.setAttribute(attrName, attrValue);
        }
      });
    }

    // 样式属性
    if (key === 'style') {
      _.forIn(value, function (styleValue, styleName) {
        node[key][styleName] = styleValue || '';
      });
    }
  } else {
    node[key] = value;
  }
}

// 移除属性
function removeProp(node, prop) {
  if (!prop || _.isString(prop)) {
    console.log('移除属性需要合法的属性名');
    return
  }
}

/**
 * Created by xuhua on 2016/10/17.
 */

function createElement(vnode) {

  var doc = document;

  var node = vnode.ele = vnode.namespace
    ? doc.createElementNS(vnode.namespace, vnode.tag)
    : doc.createElement(vnode.tag);

  var props = vnode.props;

  props && applyProps(node, props);

  _$1.each(vnode.children, function (child) {
    var childNode = createElement(child);

    if(childNode) {
      node.appendChild(childNode);
    }
  });

  return node
}

/**
 * Created by xuhua on 2016/10/20.
 */
function applyPatch(node, vpatch) {
  var patch = vpatch.patch;
  var vnode = vpatch.vnode;

  switch (vpatch.type) {
    case PATCH_TYPES.INSERT:
      return insertNode(node, patch)
    case PATCH_TYPES.REMOVE:
      return removeNode(vnode.ele)
    case PATCH_TYPES.REPLACE:
    case PATCH_TYPES.ORDER:
    case PATCH_TYPES.PROPS:
      applyProps(node, patch);
      return node
    case PATCH_TYPES.TEXT:
    default:
      return node
  }
}

function insertNode(parentNode, vnode) {
  var newNode = createElement(vnode);

  if (parentNode) {
    parentNode.appendChild(newNode);
  }

  return parentNode
}

function removeNode(node) {
  var parentNode = node.parentNode;

  if(parentNode) {
    parentNode.removeChild(node);
  }

  return null
}

/**
 * Created by xuhua on 2016/10/21.
 */
// 整个文件就是为了给Dom做一个排序，和patches对应上，没这个真的必要吗？

function domIndex(node, tree, indices) {
  if(!indices || indices.length === 0) {
    return {}
  } else {
    indices.sort(ascending);

    return recurse(node, tree, indices, 0)
  }
}

function recurse(node, tree, indices, index, nodes) {
  nodes = nodes || {};

  if(node) {
    if(indexInRange(indices, index, index)) {
      nodes[index] = node;
    }

    var vChildren = tree.children;

    // 递归
    if(vChildren) {
      var childNodes = node.childNodes;

      _$1.each(vChildren, function (vChild, i) {
        index++;

        vChild = vChild || {};

        var nextIndex = index + (vChild.count || 0);

        if(indexInRange(indices, index, nextIndex)) {
          recurse(childNodes[i], vChild, index, nodes);
        }

        index = nextIndex;
      });
    }
  }

  return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
  if (indices.length === 0) {
    return false
  }

  var minIndex = 0;
  var maxIndex = indices.length - 1;
  var currentIndex;
  var currentItem;

  while (minIndex <= maxIndex) {
    currentIndex = ((maxIndex + minIndex) / 2) >> 0;
    currentItem = indices[currentIndex];

    if (minIndex === maxIndex) {
      return currentItem >= left && currentItem <= right
    } else if (currentItem < left) {
      minIndex = currentIndex + 1;
    } else  if (currentItem > right) {
      maxIndex = currentIndex - 1;
    } else {
      return true
    }
  }

  return false;
}


function ascending(a, b) {
  return a > b ? 1 : -1
}

/**
 * Created by xuhua on 2016/10/20.
 */

function patch(node, patches) {
  var indices = patchIndices(patches);

  if (!indices.length) {
    return node
  }

  var index = domIndex(node, patches.oldNode, indices);

  _$1.each(indices, function (indice) {
    node = patchOperation(node, index[indice], patches[indice]);
  });

  return node
}

function patchOperation(node, domNode, patches) {
  if (patches) {
    if(!_$1.isArray(patches)) {
      patches = [patches];
    }

    _$1.each(patches, function (patch) {
      var newNode = applyPatch(node, patch);

      if (domNode === node) {
        node = newNode;
      }
    });
  }

  return node
}

function patchIndices(patches) {
  var indices = [];
  _$1.forIn(patches, function (patch, key) {

    if (key !== 'oldNode') {
      indices.push(Number(key));
    }
  });

  return indices
}

/**
 * Created by xuhua on 2016/10/20.
 */
var index = {
  VNode: VNode,
  diff: diff,
  createElement: createElement,
  patch: patch
};

return index;

})));

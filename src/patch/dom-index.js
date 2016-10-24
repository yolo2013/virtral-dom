import each from 'lodash/each'
// 整个文件就是为了给Dom做一个排序，和patches对应上，没这个真的必要吗？

export default function domIndex(node, tree, indices) {
  if(!indices || indices.length === 0) {
    return {}
  } else {
    indices.sort(ascending)

    return recurse(node, tree, indices, 0)
  }
}

function recurse(node, tree, indices, index, nodes) {
  nodes = nodes || {}

  if(node) {
    if(indexInRange(indices, index, index)) {
      nodes[index] = node
    }

    let vChildren = tree.children

    // 递归
    if(vChildren) {
      const childNodes = node.childNodes

      each(vChildren, (vChild, i) => {
        index++

        vChild = vChild || {}

        let nextIndex = index + (vChild.count || 0)

        if(indexInRange(indices, index, nextIndex)) {
          recurse(childNodes[i], vChild, index, nodes)
        }

        index = nextIndex
      })
    }
  }

  return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
  if (indices.length === 0) {
    return false
  }

  let minIndex = 0
  let maxIndex = indices.length - 1
  let currentIndex
  let currentItem

  while (minIndex <= maxIndex) {
    currentIndex = ((maxIndex + minIndex) / 2) >> 0
    currentItem = indices[currentIndex]

    if (minIndex === maxIndex) {
      return currentItem >= left && currentItem <= right
    } else if (currentItem < left) {
      minIndex = currentIndex + 1
    } else  if (currentItem > right) {
      maxIndex = currentIndex - 1
    } else {
      return true
    }
  }

  return false;
}


function ascending(a, b) {
  return a > b ? 1 : -1
}

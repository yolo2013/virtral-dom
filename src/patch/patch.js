import each from 'lodash/each'
import forIn from 'lodash/forIn'
import isArray from 'lodash/isArray'
import applyPatch from './apply-patch'
import domIndex from './dom-index'

export default function patch(node, patches) {
  let indices = patchIndices(patches)

  if (!indices.length) {
    return node
  }

  let index = domIndex(node, patches.oldNode, indices)

  each(indices, indice => {
    node = patchOperation(node, index[indice], patches[indice])
  })

  return node
}

function patchOperation(node, domNode, patches) {
  if (patches) {
    if(!isArray(patches)) {
      patches = [patches]
    }

    each(patches, patch => {
      let newNode = applyPatch(node, patch)

      if (domNode === node) {
        node = newNode
      }
    })
  }

  return node
}

function patchIndices(patches) {
  let indices = []
  forIn(patches, (patch, key) => {

    if (key !== 'oldNode') {
      indices.push(Number(key))
    }
  })

  return indices
}

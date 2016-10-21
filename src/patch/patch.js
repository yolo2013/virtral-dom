/**
 * Created by xuhua on 2016/10/20.
 */

import _ from 'lodash'
import applyPatch from './apply-patch'
import domIndex from './dom-index'

export default function patch(node, patches) {
  let indices = patchIndices(patches)

  if (!indices.length) {
    return node
  }

  let index = domIndex(node, patches.oldNode, indices)

  _.each(indices, indice => {
    node = patchOperation(node, index[indice], patches[indice])
  })

  return node
}

function patchOperation(node, domNode, patches) {
  if (patches) {
    if(!_.isArray(patches)) {
      patches = [patches]
    }

    _.each(patches, patch => {
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
  _.forIn(patches, (patch, key) => {

    if (key !== 'oldNode') {
      indices.push(Number(key))
    }
  })

  return indices
}

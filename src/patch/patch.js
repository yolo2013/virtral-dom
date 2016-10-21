/**
 * Created by xuhua on 2016/10/20.
 */

import _ from 'lodash'
import applyPatch from './apply-patch'

export default function patch(node, patches) {
  let indices = patchIndices(patches)

  if (!indices.length) {
    return node
  }

  let walker = {index: 0}

  walk(node, walker, patches)
}

function walk(node, walker, patches) {
  let currentPatches = patches[walker.index]

  let len = node.childNodes ? node.childNodes.length : 0

  for (let i = 0; i < len; i++) {
    let child = node.childNodes[i]
    walker.index++
    walk(child, walker, patches)
  }

  if (currentPatches) {
    if(!_.isArray(currentPatches)) {
      currentPatches = [currentPatches]
    }

    _.each(currentPatches, patch => {
      applyPatch(node, patch)
    })

  }
}

function patchIndices(patches) {
  let indices = []
  _.forIn(patches, (patch, key) => {

    if (key !== 'oldNode') {
      indices.push(patch)
    }
  })

  return indices
}

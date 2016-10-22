// 属性比对单元测试
import diffProps from '../../src/diff/diff-props'
import { expect } from 'chai'

fixture `Diff`

test('diff-props', async t => {
  let oldProps = {
    attributes: {
      name: 'Jack',
      age: 15
    }
  }

  const newProps = {
    attributes: {
      name: 'Mary'
    },
    style: {
      'color': 'red'
    }
  }

  let diff = diffProps(oldProps, newProps)

  expect(diff.attributes.name).to.equal('Mary')
  expect(diff.attributes.age).to.be.undefined
  expect(diff.style.color).to.equal('red')

  let diffRevert = diffProps(newProps, oldProps)

  expect(diffRevert.attributes.name).to.equal('Jack')
  expect(diffRevert.attributes['age']).to.equal(15)
  expect(diffRevert.style).to.be.undefined
})


'use strict'
const rsl = require('../')
const bytes = require('bytesish')
const digest = require('digestif')
const assert = require('assert')
const tsame = require('tsame')
const { it } = require('mocha')

const test = it

const same = (x, y) => assert.ok(tsame(x, y))

const validate = (a, b) => {
  assert(a.length === b.length)
  a.forEach((hash, i) => {
    same(bytes.arrayBuffer(hash), bytes.arrayBuffer(b[i]))
  })
}

test('encode and decode', async () => {
  const hash = await digest('hello world')
  const values = [hash, hash, hash]
  const block = rsl.encode(values)
  const _values = rsl.decode(block)
  validate(values, _values)
})

test('decode view', async () => {
  const hash = await digest('hello world')
  const values = [hash, hash, hash]
  const block = rsl.encode(values)
  const _values = rsl.decode(bytes(block))
  validate(values, _values)
})

test('alternate sizes', async () => {
  let values = await Promise.all([1, 2, 3].map(i => digest('hello' + i, 'SHA-512')))
  let block = rsl.encode(values)
  let _values = rsl.decode(bytes(block))
  validate(values, _values)

  values = await Promise.all([1, 2, 3].map(i => digest('hello' + i, 'SHA-384')))
  block = rsl.encode(values)
  _values = rsl.decode(bytes(block))
  validate(values, _values)
})

test('max and size', done => {
  let length = rsl.max(1e+6)
  same(length, 31249)
  length = rsl.max(1e+6, 512)
  same(length, 15624)
  let size = rsl.size(31249)
  same(size, (31249 * 32) + 1)
  size = rsl.size(15624, 512)
  same(size, (15624 * 64) + 1)
  done()
})

test('empty list', done => {
  const block = rsl.encode([])
  const empty = rsl.decode(block)
  same(empty, [])
  done()
})

/* Errors */

const errorTest = (name, fn, message) => {
  test(name, async () => {
    try {
      await fn()
      throw new Error('Succeeded when it should have failed')
    } catch (e) {
      same(e.message, message)
    }
  })
}

errorTest('unsupported hash encode', () => rsl.encode([bytes.arrayBuffer('nope')]), 'Unsupported hash size')
errorTest('variable hash sizes', async () => {
  rsl.encode(await Promise.all([digest('hello'), digest('hello', 'SHA-512')]))
}, 'Cannot encode variable hash sizes')
errorTest('unsupported hash decode', () => rsl.decode(bytes('nope')), 'Unknown hash length')

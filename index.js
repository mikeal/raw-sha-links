'use strict'
const bytes = require('bytesish')

const tableSize = {
  0: 256 / 8,
  1: 384 / 8,
  2: 512 / 8
}
const sizeTable = {
  32: 0,
  48: 1,
  64: 2
}

const algoToSize = algo => parseInt(algo.toString().replace(/\D/g, '')) / 8

const max = (size, algo = 256) => Math.floor((size / algoToSize(algo)) - 1)

const predict = (length, hashLength) => ((length * hashLength) + 1)

const empty = new Uint8Array(8)

const encode = hashes => {
  if (!hashes.length) return empty.buffer
  const len = hashes[0].byteLength
  if (typeof sizeTable[len] === 'undefined') throw new Error('Unsupported hash size')
  hashes.forEach(h => {
    if (h.byteLength !== len) throw new Error('Cannot encode variable hash sizes')
  })

  const size = predict(hashes.length, len)
  const block = new Uint8Array(size)
  block[0] = sizeTable[len]
  for (let i = 0; i < hashes.length; i++) {
    const hash = hashes[i]
    const offset = (i * len) + 1
    block.set(bytes.typedArray(hash), offset)
  }
  return block.buffer
}

const decode = block => {
  const view = bytes(block)
  const hashLength = tableSize[view.getUint8(0)]
  if (typeof hashLength === 'undefined') throw new Error('Unknown hash length')
  if (view.byteLength === 8) return [] // empty list
  const valueLength = (view.byteLength - 1) / hashLength
  const values = []
  for (let i = 0; i < valueLength; i++) {
    const offset = (i * hashLength) + 1
    values.push(bytes.slice(view, offset, offset + hashLength))
  }
  return values
}

exports.encode = encode
exports.decode = decode
exports.max = max
exports.size = (length, algo = 256) => predict(length, algoToSize(algo))

exports.tableSize = tableSize
exports.sizeTable = sizeTable

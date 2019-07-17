'use strict'
const bytes = require('bytesish')

const sizeTable = {
  256: 0,
  364: 1,
  512: 2
}
const tableSize = {
  0: 256,
  364: 1,
  512: 2
}

const predict = (length, hashLength) => ((length * hashLength) + 1)

const encode = hashes => {
  if (!hashes.length) throw new Error('Cannot encode empty List')
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
    const view = new Uint8Array(block.buffer, offset)
    view.set(new Uint8Array(hash))
  }
  return block.buffer
}

const decode = block => {
  const view = bytes(block)
  const hashLength = tableSize[view.getUint8(0)]
  if (typeof hashLength === 'undefined') throw new Error('Unknown hash length')
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

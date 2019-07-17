# raw-sha-links

Block format limited to storing a list of sha2 hashed links to `raw` binary blocks.

This is a **very** restricted block format. It is limited to representing:

* A single list of hashes.
* All hashes must link to `raw` blocks 
(does not support other [multicodecs](https://github.com/multiformats/multicodec)).
* All hashes must use sha2 encoding (256, 364 or 512).
* All hashes must be the same length, no mixing and matching hashes of different lengths.

This may seem like a very narrow case but it's actually quite common to create new lists of 
links to hashed binary blocks. 

By restricting to only SHA hashes we ensure that the block encoder/decoder can be implemented
as a very small JavaScript library using only the available hashing functions in 
[`crypto.subtle.digest`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest).

By restricting to only be a linear list of hashes we can do incredibly fast parsing without
a single memcopy.

And finally, by requiring a unified length we have the smallest possible block format for storing
this kind of data **and** we can always predict the block size required to store any number of 
link values.

## `rsl.encode(values)`

Encode an array of `values` into a new block. Every value must be an ArrayBuffer of equal length.

## `rsl.decode(binary[, stringEncoding])`

Accepts any binary type, binary view, or string. Base64 encoded strings are supported using `decode(string, 'base64')`.

Returns an array of `DataView` instances for every hash.

## `rsl.max(size[, algo='SHA-256'])`

Returns the max number of hashes that can be contained in the target size.

## `rsl.size(length[, algo='SHA-256'])`

Returns the block size for a block containing `length` number of links.

## Related Libraries

For working with binary data you may want to use [`bytesish`](https://github.com/mikeal/bytesish), 
especially if you're going to be copying or string encoding the `DataView` instances from `decode()`.

For creating digest hashes in the you may want to use [`digestish`](https://github.com/mikeal/digestish). 
It has an incredibly small bundle size and works in Browsers and Node.js and will return you an Promise
for an ArrayBuffer on both platforms which is what `raw-sha-links` expects.

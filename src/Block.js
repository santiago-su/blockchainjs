class Block {
  constructor (index, previousHash, timestamp, data, hash, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.nonce = nonce;
  }

  static get genesis() {
    return new Block(
      0,
      '0',
      1516367431,
      'A monad is just a monoid in the category of endofunctors',
      '000e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      420
    );
  }
}

module.exports = Block;
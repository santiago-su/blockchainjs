const crypto = require('crypto');
const Block = require('./Block.js');

class Blockchain {
  constructor() {
    this.blockchain = [Block.genesis];
    this.difficulty = 3;
  }

  get() {
    return this.blockchain;
  }

  get latestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  isValidHashDifficulty(hash) {
    for (var i = 0; i < hash.length; i++) {
      if (hash[i] !== '0') break;
    }
    return i >= this.difficulty;
  }

  calculateHash(index, previousHash, timestamp, data, nonce) {
    return crypto
      .createHash('sha256')
      .update(index + previousHash + timestamp + data + nonce)
      .digest('hex');
  }

  calculateHashForBlock(block) {
    const {index, previousHash, timestamp, data, nonce} = block;
    return this.calculateHash(index, previousHash, timestamp, data, nonce);
  }

  mine(data) {
    const newBlock = this.generateNextBlock(data);
    try {
      this.addBlock(newBlock);
    } catch(err) {
      throw err;
    }
  }

  generateNextBlock(data) {
    const nextIndex = this.latestBlock.index + 1;
    const previousHash = this.latestBlock.hash;
    let timestamp = new Date().getTime() / 1000;
    let nonce = 0;
    let nextHash = this.calculateHash(
      nextIndex,
      previousHash,
      timestamp,
      data,
      nonce
    );

    while (!this.isValidHashDifficulty(nextHash)) {
      nonce = nonce + 1;
      timestamp = new Date().getTime() / 1000;
      nextHash = this.calculateHash(
        nextIndex,
        previousHash,
        timestamp,
        data,
        nonce
      );
    }

    const nextBlock = new Block(
      nextIndex,
      previousHash,
      timestamp,
      data,
      nextHash,
      nonce
    );

    return nextBlock;
  }

  addBlock(newBlock) {
    this.isValidNextBlock(newBlock, this.latestBlock)
      ? this.blockchain.push(newBlock)
      : console.log('Invalid block');
  }

  isValidNextBlock(nextBlock, previousBlock) {
    const nextBlockHash = this.calculateHashForBlock(nextBlock);
    if (previousBlock.index + 1 !== nextBlock.index) {
      return false;
    } else if (previousBlock.hash !== nextBlock.previousHash) {
      return false;
    } else if (nextBlockHash !== nextBlock.hash) {
      return false;
    } else if (!this.isValidHashDifficulty(nextBlockHash)) {
      return false;
    } else {
      return true;
    }
  }

  validChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis)) return false;
    const tempChain = [chain[0]];
    for (let i = 1; i < chain.length; i = i + 1) {
      if (this.isValidNextBlock(chain[i], tempChain[i - 1])) {
        tempChain.push(chain[i]);
      }
      return false;
    }
    return true;
  }

  isChainLonger(chain) {
    return chain.length > this.blockchain.length;
  }

  replaceChain(newChain) {
    this.validChain(newChain) && this.isChainLonger(newChain)
      ? this.blockchain = JSON.parse(JSON.stringify(newChain))
      : console.log('Error: invalid chain');
  }
}

module.exports = Blockchain;
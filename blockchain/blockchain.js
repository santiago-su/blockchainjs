const crypto = require('crypto');

const BLOCKCHAIN = {
  'chain': [genesis()],
  'difficulty': 3
}

const block = (index, previousHash, timestamp, data, hash, nonce) => {
  return {
    index,
    previousHash,
    timestamp,
    data,
    hash,
    nonce
  }
}

const genesis = () =>
  block(
    '0',
    1516367431,
    'A monad is just a monoid in the category of endofunctors',
    '000e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    420
  )

const getLatestBlock = () => {
  return BLOCKCHAIN[BLOCKCHAIN.chain.length - 1];
}

const validHashDifficulty = (hash) => {
  for (var i = 0; i < hash.length; i++) {
    if (hash[i] !== '0') break;
  }
  return i >= BLOCKCHAIN.difficulty;
}

const calculateHash = (index, previousHash, timestamp, data, nonce) =>
  crypto
    .createHash("sha256")
    .update(index + previousHash + timestamp + data + nonce)
    .digest("hex");

const calculateBlockHash = (block) =>
  calculateHash(...block)

const generateNextBlock = (data) => {
  const latestBlock = getLatestBlock();
  const nextIndex = latestBlock.index + 1;
  const previousHash = latestBlock.hash;
  let timestamp = new Date().getTime() / 1000;
  let nonce = 0;
  let nextHash = calculateHash(
    nextIndex,
    previousHash,
    timestamp,
    data,
    nonce
  )

  while(!validHashDifficulty(nextHash)) {
    nonce = nonce + 1;
    timestamp = new Date().getTime() / 1000;
    nextHash = calculateHash(
      nextIndex,
      previousHash,
      timestamp,
      data,
      nonce
    );
  }

  return block(
    nextIndex,
    previousHash,
    timestamp,
    data,
    nextHash,
    nonce
  )

}

const validNextBlock = (nextBlock, prevBlock) => {
  const nextBlockHash = calculateBlockHash(nextBlock);
  if (prevBlock.index + 1 !== nextBlock.index) {
    return false;
  } else if (prevBlock.hash !== nextBlock.previousHash) {
    return false;
  } else if (nextBlockHash !== nextBlock.hash) {
    return false;
  } else if (!validHashDifficulty(nextBlockHash)) {
    return false;
  }
  return true;
}

const addBlock = (newBlock) => {
  const latestBlock = getLatestBlock();
  validNextBlock(newBlock, latestBlock)
    ? BLOCKCHAIN.chain.push(newBlock)
    : console.log('Invalid block');
}

const mine = (data) => {
  const newBlock = generateNextBlock(data);
  return addBlock(newBlock);
}

const validChain = (chain) => {
  if (JSON.stringify(chain[0]) !== JSON.stringify(genesis())) return false;
  const tempChain = [chain[0]];
  for (let i = 1; i < chain.length; i++) {
    if (validNextBlock(chain[i], tempChain[i - 1])) {
      tempChain.push(chain[i]);
    }
    return false;
  }
  return true;
}

const isLongerChain = (chain) => {
  chain.length > BLOCKCHAIN.length;
}

const replaceChain = (newChain) => {
  validChain(newChain) && isLongerChain(newChain)
    ? BLOCKCHAIN = JSON.parse(JSON.stringify(newChain))
    : console.log('Invalid chain')
}
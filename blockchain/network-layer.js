#!/usr/bin/env node

const crypto = require('crypto');
const kadence = require('@kadenceproject/kadence');
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const storage = levelup(encoding(leveldown('./.dat')));
const os = require('os');
const port = 8080;
const logger = bunyan.createLogger({ name: 'BlockchainJS' });
const transport = new kadence.HTTPTransport();
const identity = kadence.utils.getRandomKeyBuffer();
const contact = { hostname: os.hostname(), port };
const Blockchain = require('./Blockchain');

const node = new kadence({ transport, storage, logger, identity, contact });

const bchain = new Blockchain();


// Use existing "base" rules to add additional logic to the base kad routes
// This is useful for things like validating key/value pairs
node.use('STORE', (request, response, next) => {
  let [key, val] = request.params;
  let hash = crypto.createHash('rmd160').update(val).digest('hex');

  // Ensure values are content-addressable
  if (key !== hash) {
    return next(new Error('Key must be the RMD-160 hash of value'));
  }

  next();
});

// Global error handler
node.use((err, request, response, next) => {
  response.send({ error: err.message });
});

node.discoverClosestNeighbor = () => {
  let neighbor = [
    ...node.router.getClosestContactsToKey(identity).entries()
  ].shift();
  logger.info(`This is your closest peer ${neighbor}`)
}

const broadcastLatestBlock = () => {
  node.use('BROADCAST_LATEST_BLOCK', (req, res, next) => {
    res.send(bchain.latestBlock);
  })
}

const handleMessage = (message) => {
  // switch ()
}

const broadcastBlockchain = () => {
  node.use('BROADCAST_BLOCKCHAIN', (req, res, next) => {
    res.send(bchain.get());
  })
}

const handleReceivedLatestBlock = (message) => {
  node.use('RECEIVE_LATEST_BLOCK', (req, res, next) => {
    let incomingMessage = req.params;
    bchain.mine(incomingMessage)
    broadcastBlockchain();
  })
}

const handleReceivedBlockchain = (message) => {
  node.use('RECEIVE_BLOCKCHAIN', (req, res, next) => {
    let incomingMessage = req.params;
    bchain.replaceChain(incomingMessage);
    broadcastBlockchain();
  })
}


const listenToPeers = () => {
  node.listen(1337);
}

const joinPeers = () => {
  node.join(['ea48d3f07a5241291ed0b4cab6483fa8b8fcc127', {
    hostname: 'seed.host.name',
    port: port
  }], () => {
    logger.info(`Connected to ${node.router.length} peers!`)
  });
}

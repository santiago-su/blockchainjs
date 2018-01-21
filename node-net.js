#!/usr/bin/env node

const crypto = require('crypto');
const kad = require('kad');
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const storage = levelup(leveldown('./.dat'));
const os = require('os');
const port = 8080;
const logger = bunyan.createLogger({ name: 'BlockchainJS' });
const transport = new kad.HTTPTransport();
const identity = kad.utils.getRandomKeyBuffer();
const contact = { hostname: os.hostname(), port };

const node = new kad({ transport, storage, logger, identity, contact });


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
    node.router.getClosestContactsToKey(identity).entries()
  ].shift();
  logger.info(`This is your closest peer ${neighbor}`)
}

// Custom plugins
node.plugin(function() {
  this.broadcastLatest = (latest, callback) => {
    this.send('BROADCAST_LATEST', {
      message: latest
    }, this.router.getNearestContacts(this.identity, 1).pop(), callback);
  };
});

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

const broadcastLatest = () => {
  // Broadcast latest
}

const handleMessage = (message) => {
  // Handle incoming messages requests and receives
}

const handleReceivedLatestBlock = (message) => {
  // Receive latest block
}

const handleReceivedBlockchain = (message) => {
  // Handle received blockchain
}


// Use "userland" (that's you!) rules to create your own protocols
// node.use('ECHO', (request, response, next) => {
//   if (['fuck'].includes(request.params.message)) {
//     return next(new Error(
//       `Oh goodness, I dare not say "${request.params.message}"`
//     ));
//   }

//   response.send(request.params);
// });
// Define error handlers for specific rules the same way, but including the
// rule name as the first argument
// node.use('ECHO', (err, request, response, next) => {
//   response.send({
//     error: err.message.replace(request.params.message, '[redacted]')
//   });
// });


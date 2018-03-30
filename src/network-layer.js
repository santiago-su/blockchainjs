#!/usr/bin/env genesisNode

const crypto = require('crypto');
const kadence = require('@kadenceproject/kadence');
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const storage = levelup(encoding(leveldown('./dbOne')));
const storageTwo = levelup(encoding(leveldown('./dbTwo')));
const storageThree = levelup(encoding(leveldown('./dbThree')));
const os = require('os');
const logger = bunyan.createLogger({ name: 'BlockchainJS' });
const identity = kadence.utils.getRandomKeyBuffer();
const contactGenesis = { hostname: os.hostname(), port: 8080 };
const contactOne = { hostname: os.hostname(), port: 1337 };
const contactTwo = { hostname: os.hostname(), port: 1338 };
const contactThree = { hostname: os.hostname(), port: 1339 };
const Blockchain = require('./Blockchain');


const genesisNode = kadence({ transport: new kadence.HTTPTransport(), storage, logger, identity, contact: contactGenesis });
genesisNode.listen(8000);

genesisNode.join([identity, {
  hostname: os.hostname(),
  port: 8080
}]);

const nodeOne = kadence({ transport: new kadence.HTTPTransport(), storage: storageTwo, logger, contact: contactOne });
nodeOne.listen(1337);

genesisNode.join([nodeOne.identity, nodeOne.contact]);

const nodeTwo = new kadence({ transport: new kadence.HTTPTransport(), storage: storageThree, logger, contact: contactTwo });
nodeTwo.listen(1338);

genesisNode.join([nodeTwo.identity, nodeTwo.contact]);

console.log(`genesisNode connected to ${genesisNode.router.size} peers!`);


const bchain = new Blockchain();


// Use existing "base" rules to add additional logic to the base kad routes
// This is useful for things like validating key/value pairs
// genesisNode.use('STORE', (request, response, next) => {
//   let [key, val] = request.params;
//   let hash = crypto.createHash('rmd160').update(val).digest('hex');

//   // Ensure values are content-addressable
//   if (key !== hash) {
//     return next(new Error('Key must be the RMD-160 hash of value'));
//   }

//   next();
// });

// // Global error handler
// genesisNode.use((err, request, response, next) => {
//   response.send({ error: err.message });
// });

// genesisNode.discoverClosestNeighbor = () => {
//   let neighbor = [
//     ...genesisNode.router.getClosestContactsToKey(identity).entries()
//   ].shift();
//   logger.info(`This is your closest peer ${neighbor}`)
// }

// const broadcastLatestBlock = () => {
//   genesisNode.use('BROADCAST_LATEST_BLOCK', (req, res, next) => {
//     res.send(bchain.latestBlock);
//   })
// }

// const broadcastBlockchain = () => {
//   genesisNode.use('BROADCAST_BLOCKCHAIN', (req, res, next) => {
//     res.send(bchain.get());
//   })
// }

// const handleReceivedLatestBlock = (message) => {
//   genesisNode.use('RECEIVE_LATEST_BLOCK', (req, res, next) => {
//     let incomingMessage = req.params;
//     bchain.mine(incomingMessage.data)
//     broadcastBlockchain();
//   })
// }

// const handleReceivedBlockchain = (message) => {
//   genesisNode.use('RECEIVE_BLOCKCHAIN', (req, res, next) => {
//     let incomingMessage = req.params;
//     bchain.replaceChain(incomingMessage);
//     broadcastBlockchain();
//   })
// }


// const listenToPeers = () => {
//   genesisNode.listen(1337);
// }

// const joinPeers = () => {
//   genesisNode.join(['ea48d3f07a5241291ed0b4cab6483fa8b8fcc127', {
//     hostname: 'seed.host.name',
//     port: port
//   }], () => {
//     logger.info(`Connected to ${genesisNode.router.length} peers!`)
//   });
// }

// module.exports.listenToPeers = listenToPeers;
// module.exports.joinPeers = joinPeers;
// module.exports.getBlockchain = logger.info(bchain.get);
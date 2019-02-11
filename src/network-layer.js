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
const logger = bunyan.createLogger({ name: 'BlockchainJS', src: true, level: 'info' });
const identity = kadence.utils.getRandomKeyBuffer();
const contactGenesis = { hostname: os.hostname(), port: 45000 };
const contactOne = { hostname: os.hostname(), port: 1337 };
const contactTwo = { hostname: os.hostname(), port: 1338 };
const contactThree = { hostname: os.hostname(), port: 1339 };
const Blockchain = require('./Blockchain');
const bchain = new Blockchain();

const genesisNode = new kadence.KademliaNode({ transport: new kadence.HTTPTransport(), storage, logger, identity, contact: contactGenesis });

// Global error handler
genesisNode.use((err, request, response, next) => {
  logger.info('+==================================+', err, request)
  response.send({ error: err.message });
});

genesisNode.use('BROADCAST_LATEST_BLOCK', (req, res) => {
  logger.info('==================Sending latest block===================');
  logger.info(bchain.latestBlock);
  res.send(bchain.latestBlock);
})

genesisNode.use('BROADCAST_BLOCKCHAIN', (req, res, next) => {
  logger.info('==================Broadcasting blockchain===================');
  logger.info(bchain.get);
  res.send(bchain.get);
})

genesisNode.use('RECEIVE_BLOCKCHAIN', (req, res, next) => {
  let incomingMessage = req.params;
  bchain.replaceChain(...incomingMessage);
  // broadcast blockchain
})

genesisNode.use('RECEIVE_LATEST_BLOCK', (req, res, next) => {
  logger.info('==================Receiving latest block===================');
  let incomingMessage = req.params;
  (async () => {
    await bchain.mine(...incomingMessage);
    await logger.info(bchain.get())
    // broadcast blockchain
  })().catch(console.log)
})

genesisNode.use((err, request, response, next) => {
  logger.error(err.message)
  response.send({error: err.message});
});

genesisNode.listen(45000, () => {
  logger.info(`genesisNode connected to ${genesisNode.router.size} peers!`);
  logger.info(`genesisNode is exposed at ${genesisNode.contact.hostname}:${genesisNode.contact.port}`);
});

const nodeOne = new kadence.KademliaNode({ transport: new kadence.HTTPTransport(), storage: storageTwo, logger, contact: contactOne });
nodeOne.listen(1337);

const nodeTwo = new kadence.KademliaNode({ transport: new kadence.HTTPTransport(), storage: storageThree, logger, contact: contactTwo });
nodeTwo.listen(1338);


genesisNode.join([nodeOne.identity, nodeOne.contact]);
genesisNode.join([nodeTwo.identity, nodeTwo.contact]);

nodeOne.send('RECEIVE_LATEST_BLOCK', ['testdata'], [genesisNode.identity.toString('hex'), genesisNode.contact], () => logger.info('success!'))


// genesisNode.discoverClosestNeighbor = () => {
//   let neighbor = [...genesisNode.router.getClosestContactsToKey(identity).entries()].shift();
//   logger.info(`This is your closest peer ${neighbor}`)
// }

#!/usr/bin/env node

const network = require('./src/network-layer');
const program = require('commander');

program.description('Blockchain Proof of concept')
program.version('0.1.0')
program.option('connect', 'Starts listening on nodes')
program.option('join', 'Join peers')
program.option('closestNeighbor',  'Finds the closest peer to your node')
program.option('getBlockchain',  'Gets the blockchain')
program.option('broadcastNewBlock', 'Sends a broadcast to peers with the latest block of the blockchain')
program.option('receiveLatestBlock',  'Receives latest block and mines blockchain')
program.option('receiveBlockchain',   'Receives blockchain and replaces current blockchain if longer')
program.parse(process.argv);

if (program.receiveLatestBlock) {
  network.handleReceivedLatestBlock;
}

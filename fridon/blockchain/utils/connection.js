const { Connection, clusterApiUrl } = require('@solana/web3.js');
const { SOLANA_NETWORK } = require('./constants');

let connection = null;

function getConnection() {
    if (!connection) {
        const endpoint = process.env.RPC_URL || clusterApiUrl(SOLANA_NETWORK);
        connection = new Connection(endpoint, 'confirmed');
    }
    return connection;
}

module.exports = { getConnection };
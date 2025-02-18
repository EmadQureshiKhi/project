const WalletService = require('../blockchain/services/wallet.service');

class WalletPlugin {
    async process(message) {
        try {
            const { address, action } = this.parseMessage(message);
            if (!address) return null;

            let result;
            if (action === 'balance') {
                result = await WalletService.getBalance(address);
            }

            return JSON.stringify(result);
        } catch (error) {
            console.error('Wallet plugin error:', error);
            return null;
        }
    }

    parseMessage(message) {
        const address = message.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
        const action = message.toLowerCase().includes('balance') ? 'balance' : null;
        
        return {
            address: address ? address[0] : null,
            action
        };
    }
}

module.exports = { WalletPlugin };
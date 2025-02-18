const { BirdeyeProvider } = require('../analytics/providers/birdeye');

class CoinObserver {
    async process(message) {
        try {
            const address = this.extractAddress(message);
            if (!address) return null;

            const now = Date.now();
            const dayAgo = now - (24 * 60 * 60 * 1000);
            
            const data = await BirdeyeProvider.getOHLCV(
                address,
                '1h',
                dayAgo,
                now
            );

            return JSON.stringify(data);
        } catch (error) {
            console.error('Coin observer error:', error);
            return null;
        }
    }

    extractAddress(message) {
        // Simple Solana address extraction - can be enhanced
        const match = message.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
        return match ? match[0] : null;
    }
}

module.exports = { CoinObserver };
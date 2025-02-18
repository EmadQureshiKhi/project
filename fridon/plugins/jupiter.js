const SwapService = require('../blockchain/services/swap.service');

class JupiterPlugin {
    async process(message) {
        try {
            const { fromToken, toToken, amount } = this.parseSwapMessage(message);
            if (!fromToken || !toToken || !amount) return null;

            const result = await SwapService.swap(null, fromToken, toToken, amount);
            return JSON.stringify(result);
        } catch (error) {
            console.error('Jupiter plugin error:', error);
            return null;
        }
    }

    parseSwapMessage(message) {
        // Enhanced parsing can be implemented
        const tokens = message.match(/[A-Z]{2,10}/g) || [];
        const amount = message.match(/\d+(\.\d+)?/);

        return {
            fromToken: tokens[0] || null,
            toToken: tokens[1] || null,
            amount: amount ? parseFloat(amount[0]) : null
        };
    }
}

module.exports = { JupiterPlugin };
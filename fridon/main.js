const { analyzeCoin } = require('./core/analyzer');
const { CoinTechnicalAnalyzer } = require('./plugins/coinTechnicalAnalyzer');
const { CoinTechnicalChartSearcher } = require('./plugins/coinTechnicalChartSearcher');
const { CoinObserver } = require('./plugins/coinObserver');
const { WalletPlugin } = require('./plugins/wallet');
const { JupiterPlugin } = require('./plugins/jupiter');

class FridonAI {
    constructor() {
        this.plugins = [
            new CoinTechnicalAnalyzer(),
            new CoinTechnicalChartSearcher(),
            new CoinObserver(),
            new WalletPlugin(),
            new JupiterPlugin()
        ];
    }

    async analyze(message, config = {}) {
        try {
            const response = await analyzeCoin(message, this.plugins, {
                ...config,
                memory: 'sqlite'
            });
            return response;
        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }
}

module.exports = FridonAI;
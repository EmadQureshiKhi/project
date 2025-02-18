const { EmperorAnalysis } = require('../analytics/indicators/emperor');
const { BinanceProvider } = require('../analytics/providers/binance');

class CoinTechnicalChartSearcher {
    async process(message) {
        try {
            const symbol = this.extractSymbol(message);
            if (!symbol) return null;

            const data = await BinanceProvider.getOHLCV(symbol, '4h');
            
            const analysis = {
                emaCrossover: EmperorAnalysis.analyzeEMACrossover(data),
                support200EMA: EmperorAnalysis.analyze200EMASupport(data)
            };

            return JSON.stringify(analysis);
        } catch (error) {
            console.error('Chart analysis error:', error);
            return null;
        }
    }

    extractSymbol(message) {
        const match = message.match(/\b[A-Z]{2,10}\b/);
        return match ? match[0] : null;
    }
}

module.exports = { CoinTechnicalChartSearcher };
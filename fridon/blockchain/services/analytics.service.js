const BinanceProvider = require('../../analytics/providers/binance');
const BirdeyeProvider = require('../../analytics/providers/birdeye');

class AnalyticsService {
  async analyze(symbol, interval = '1h') {
    try {
      console.log(`Starting comprehensive analysis for ${symbol}...`);
      
      let priceData;
      try {
        console.log(`Fetching price data for ${symbol}USDT...`);
        priceData = await BinanceProvider.getPrice(symbol);
      } catch (binanceError) {
        console.log('Binance API failed, trying Birdeye...');
        priceData = await BirdeyeProvider.getPrice(symbol);
      }

      if (!priceData) {
        throw new Error('Unable to fetch price data from any source');
      }

      // Basic analysis structure if detailed data isn't available
      return {
        price: priceData,
        timestamp: Date.now(),
        indicators: {
          rsi: 50, // neutral value
          macd: {
            macd: 0,
            signal: 0,
            histogram: 0
          }
        },
        riskAnalysis: {
          volatility: 0,
          volumeTrend: 0,
          momentum: 0,
          riskScore: 50
        },
        trendAnalysis: {
          direction: 'SIDEWAYS',
          strength: 50,
          momentum: 0
        },
        volumeAnalysis: {
          volumeTrend: 0,
          priceVolumeCorrelation: 0,
          abnormalVolume: false
        },
        tradersAnalysis: {
          whaleMovements: 0,
          averageWhaleVolume: 0,
          significantLevels: [
            { price: priceData * 1.1, type: 'RESISTANCE' },
            { price: priceData * 0.9, type: 'SUPPORT' }
          ]
        }
      };
    } catch (error) {
      console.error('Analytics error:', error);
      throw new Error(`Failed to fetch data for ${symbol}: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();

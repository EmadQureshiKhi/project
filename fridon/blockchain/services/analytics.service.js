const BinanceProvider = require('../../analytics/providers/binance');
const BirdeyeProvider = require('../../analytics/providers/birdeye');
const { calculateIndicators } = require('../../analytics/indicators/ta');
const EmperorAnalysis = require('../../analytics/indicators/emperor');

class AnalyticsService {
    static async analyze(coin, interval = '1h') {
        try {
            console.log(`Starting comprehensive analysis for ${coin}...`);
            
            // Get both current price and OHLCV data
            const data = await BinanceProvider.getOHLCV(coin, interval);
            console.log('Received data from Binance:', {
                price: data.currentPrice,
                timestamp: new Date(data.timestamp).toISOString(),
                ohlcvLength: data.ohlcv?.length
            });
            
            if (!data.currentPrice || !data.ohlcv || data.ohlcv.length === 0) {
                throw new Error('Invalid or missing price/OHLCV data');
            }

            // Comprehensive analysis response
            const response = {
                price: data.currentPrice,
                timestamp: data.timestamp,
                ohlcv: data.ohlcv,
                indicators: calculateIndicators(data.ohlcv)
            };

            try {
                // Risk Analysis
                const riskAnalysis = EmperorAnalysis.analyzeRisk(data.ohlcv);
                console.log('Risk analysis results:', riskAnalysis);
                response.riskAnalysis = riskAnalysis;

                // Trend Analysis
                const trendAnalysis = EmperorAnalysis.analyzeTrend(data.ohlcv);
                console.log('Trend analysis results:', trendAnalysis);
                response.trendAnalysis = trendAnalysis;

                // Volume Analysis
                const volumeAnalysis = EmperorAnalysis.analyzeVolume(data.ohlcv);
                console.log('Volume analysis results:', volumeAnalysis);
                response.volumeAnalysis = volumeAnalysis;

                // Traders Analysis
                const tradersAnalysis = EmperorAnalysis.analyzeTraders(data.ohlcv);
                console.log('Traders analysis results:', tradersAnalysis);
                response.tradersAnalysis = tradersAnalysis;

            } catch (analysisError) {
                console.error('Analysis component failed:', analysisError);
                // Continue with partial analysis if some components fail
            }

            // Validate the price
            if (!response.price || isNaN(response.price)) {
                throw new Error('Invalid price data received');
            }

            console.log('Comprehensive analysis complete:', {
                price: response.price,
                timestamp: new Date(response.timestamp).toISOString(),
                hasRiskAnalysis: !!response.riskAnalysis,
                hasTrendAnalysis: !!response.trendAnalysis,
                hasVolumeAnalysis: !!response.volumeAnalysis,
                hasTradersAnalysis: !!response.tradersAnalysis
            });

            return response;
        } catch (error) {
            console.error('Analytics error:', error);
            throw error;
        }
    }
}

module.exports = AnalyticsService;
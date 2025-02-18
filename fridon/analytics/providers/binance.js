class BinanceProvider {
    static async getOHLCV(symbol, interval = '1h', limit = 100) {
        try {
            console.log(`Fetching price data for ${symbol}USDT...`);
            
            // Get current price first
            const priceResponse = await fetch(
                `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
            );
            
            if (!priceResponse.ok) {
                throw new Error(`Price API error: ${priceResponse.status}`);
            }
            
            const priceData = await priceResponse.json();
            console.log('Current price data:', priceData);

            // Get OHLCV data
            const ohlcvResponse = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
            );
            
            if (!ohlcvResponse.ok) {
                throw new Error(`OHLCV API error: ${ohlcvResponse.status}`);
            }
            
            const ohlcvData = await ohlcvResponse.json();
            
            if (!Array.isArray(ohlcvData) || ohlcvData.length === 0) {
                throw new Error('Invalid OHLCV data format received');
            }
            
            console.log('OHLCV first entry:', ohlcvData[0]);
            
            if (!priceData.price || isNaN(parseFloat(priceData.price))) {
                throw new Error('Invalid price data received from Binance');
            }
            
            const result = {
                ohlcv: ohlcvData,
                currentPrice: parseFloat(priceData.price),
                timestamp: Date.now()
            };
            
            console.log('Processed result:', {
                currentPrice: result.currentPrice,
                timestamp: new Date(result.timestamp).toISOString(),
                ohlcvLength: ohlcvData.length
            });
            
            return result;
        } catch (error) {
            console.error('Binance API error:', error);
            throw new Error(`Failed to fetch data for ${symbol}: ${error.message}`);
        }
    }
}

module.exports = BinanceProvider;
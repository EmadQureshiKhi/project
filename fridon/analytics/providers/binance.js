const axios = require('axios');

class BinanceProvider {
  constructor() {
    this.baseUrl = 'https://api.binance.com/api/v3';
    this.fallbackUrl = 'https://api-testnet.binance.vision/api/v3'; // Fallback URL
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getOHLCV(symbol, interval = '1h', limit = 24) {
    try {
      // Try main API first
      const response = await this.client.get(`${this.baseUrl}/klines`, {
        params: {
          symbol: symbol.toUpperCase() + 'USDT',
          interval,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.log('Primary Binance API failed, trying fallback...');
      try {
        // Try fallback API
        const fallbackResponse = await this.client.get(`${this.fallbackUrl}/klines`, {
          params: {
            symbol: symbol.toUpperCase() + 'USDT',
            interval,
            limit
          }
        });
        return fallbackResponse.data;
      } catch (fallbackError) {
        // If both fail, try alternative data source
        try {
          const priceResponse = await this.client.get(`${this.baseUrl}/ticker/price`, {
            params: {
              symbol: symbol.toUpperCase() + 'USDT'
            }
          });
          
          // Create a basic OHLCV structure with current price
          const price = parseFloat(priceResponse.data.price);
          const timestamp = Date.now();
          
          // Return simplified data structure
          return [{
            openTime: timestamp,
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 0,
            closeTime: timestamp,
            quoteAssetVolume: 0,
            trades: 0,
            takerBuyBaseAssetVolume: 0,
            takerBuyQuoteAssetVolume: 0
          }];
        } catch (finalError) {
          console.error('All Binance API attempts failed:', finalError);
          throw new Error(`Price API error: ${finalError.response?.status || finalError.message}`);
        }
      }
    }
  }

  async getPrice(symbol) {
    try {
      const response = await this.client.get(`${this.baseUrl}/ticker/price`, {
        params: {
          symbol: symbol.toUpperCase() + 'USDT'
        }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      try {
        // Try fallback
        const fallbackResponse = await this.client.get(`${this.fallbackUrl}/ticker/price`, {
          params: {
            symbol: symbol.toUpperCase() + 'USDT'
          }
        });
        return parseFloat(fallbackResponse.data.price);
      } catch (fallbackError) {
        console.error('Failed to fetch price from Binance:', fallbackError);
        throw new Error(`Price API error: ${fallbackError.response?.status || fallbackError.message}`);
      }
    }
  }
}

module.exports = new BinanceProvider();

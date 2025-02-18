const axios = require('axios');

class BinanceProvider {
  constructor() {
    // Use the main Binance API URL
    this.baseUrl = 'https://api.binance.com';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0' // Add user agent to prevent some blocks
      },
      validateStatus: status => status < 500 // Handle only 5xx errors as failures
    });
  }

  async getOHLCV(symbol, interval = '1h', limit = 24) {
    try {
      console.log(`Fetching OHLCV data for ${symbol}USDT from Binance...`);
      const response = await this.client.get('/api/v3/klines', {
        params: {
          symbol: `${symbol.toUpperCase()}USDT`,
          interval,
          limit
        }
      });

      if (response.status === 451) {
        throw new Error('Geographic restrictions - try using a different region');
      }

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response from Binance');
      }

      return response.data;
    } catch (error) {
      console.error('Binance OHLCV error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(`Binance OHLCV API error: ${error.message}`);
    }
  }

  async getPrice(symbol) {
    try {
      console.log(`Fetching price for ${symbol}USDT from Binance...`);
      const response = await this.client.get('/api/v3/ticker/price', {
        params: {
          symbol: `${symbol.toUpperCase()}USDT`
        }
      });

      if (response.status === 451) {
        throw new Error('Geographic restrictions - try using a different region');
      }

      if (!response.data || !response.data.price) {
        throw new Error('Invalid price data from Binance');
      }

      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Binance price error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(`Binance price API error: ${error.message}`);
    }
  }
}

module.exports = new BinanceProvider();

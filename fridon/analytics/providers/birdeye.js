class BirdeyeProvider {
  static async getOHLCV(address, interval, timeFrom, timeTo) {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/ohlcv?address=${address}&type=${interval}&time_from=${timeFrom}&time_to=${timeTo}`,
      {
        headers: {
          'X-API-KEY': process.env.BIRDEYE_API_KEY,
          'x-chain': 'solana',
        },
      }
    );
    return await response.json();
  }
}

module.exports = BirdeyeProvider;

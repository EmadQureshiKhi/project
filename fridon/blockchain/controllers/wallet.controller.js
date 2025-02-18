const WalletService = require('../services/wallet.service');

class WalletController {
  static async getBalance(req, res) {
    try {
      const { walletAddress, currency } = req.body;
      const balance = await WalletService.getBalance(walletAddress, currency);
      res.json({ data: balance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async transfer(req, res) {
    try {
      const { fromAddress, toAddress, amount, currency } = req.body;
      const tx = await WalletService.transfer(fromAddress, toAddress, amount, currency);
      res.json({ data: tx });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = WalletController;

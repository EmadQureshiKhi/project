const SwapService = require('../services/swap.service');

class SwapController {
  static async swap(req, res) {
    try {
      const { walletAddress, fromToken, toToken, amount } = req.body;
      const tx = await SwapService.swap(walletAddress, fromToken, toToken, amount);
      res.json({ data: tx });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SwapController;

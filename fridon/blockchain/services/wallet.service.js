const connection = require('../utils/connection');
const { PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } = require('@solana/spl-token');

class WalletService {
  static async getBalance(walletAddress, currency) {
    try {
      const pubkey = new PublicKey(walletAddress);
      
      if (currency === 'SOL') {
        const balance = await connection.getBalance(pubkey);
        return balance;
      } else {
        const tokenMint = new PublicKey(currency);
        const tokenAccount = await getAssociatedTokenAddress(tokenMint, pubkey);
        const balance = await connection.getTokenAccountBalance(tokenAccount);
        return balance.value.uiAmount;
      }
    } catch (error) {
      console.error('Get balance error:', error);
      throw error;
    }
  }

  static async transfer(fromAddress, toAddress, amount, currency) {
    try {
      const fromPubkey = new PublicKey(fromAddress);
      const toPubkey = new PublicKey(toAddress);
      
      const transaction = new Transaction();

      if (currency === 'SOL') {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: amount
          })
        );
      } else {
        const tokenMint = new PublicKey(currency);
        const fromTokenAccount = await getAssociatedTokenAddress(tokenMint, fromPubkey);
        const toTokenAccount = await getAssociatedTokenAddress(tokenMint, toPubkey);

        // Create token account if it doesn't exist
        const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
        if (!toTokenAccountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              fromPubkey,
              toTokenAccount,
              toPubkey,
              tokenMint
            )
          );
        }

        transaction.add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            fromPubkey,
            amount
          )
        );
      }

      const signature = await connection.sendTransaction(transaction);
      return { status: 'success', signature };
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  }

  static async createTokenAccount(walletAddress, tokenMint) {
    try {
      const pubkey = new PublicKey(walletAddress);
      const mint = new PublicKey(tokenMint);
      
      const tokenAccount = await getAssociatedTokenAddress(mint, pubkey);
      const transaction = new Transaction();

      transaction.add(
        createAssociatedTokenAccountInstruction(
          pubkey,
          tokenAccount,
          pubkey,
          mint
        )
      );

      const signature = await connection.sendTransaction(transaction);
      return { status: 'success', tokenAccount: tokenAccount.toString() };
    } catch (error) {
      console.error('Create token account error:', error);
      throw error;
    }
  }
}

module.exports = WalletService;
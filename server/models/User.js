const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Use absolute path for database file
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      wallet_address TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

class User {
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static async findByWallet(walletAddress) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static async create({ email, password, walletAddress }) {
    return new Promise(async (resolve, reject) => {
      try {
        let hashedPassword = null;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }

        db.run(
          'INSERT INTO users (email, password, wallet_address) VALUES (?, ?, ?)',
          [email || null, hashedPassword, walletAddress || null],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              reject(err);
              return;
            }
            
            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
              if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
              }
              resolve(row);
            });
          }
        );
      } catch (error) {
        console.error('Create user error:', error);
        reject(error);
      }
    });
  }

  static async validatePassword(user, password) {
    if (!user || !user.password) return false;
    return bcrypt.compare(password, user.password);
  }
}

module.exports = User;
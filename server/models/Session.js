const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create sessions table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      session_id TEXT UNIQUE,
      chat_history TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

class Session {
  static async create(userId, sessionId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO sessions (user_id, session_id) VALUES (?, ?)',
        [userId, sessionId],
        function(err) {
          if (err) {
            console.error('Create session error:', err);
            reject(err);
            return;
          }
          resolve({ id: this.lastID, user_id: userId, session_id: sessionId });
        }
      );
    });
  }

  static async findBySessionId(sessionId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM sessions WHERE session_id = ?',
        [sessionId],
        (err, row) => {
          if (err) {
            console.error('Find session error:', err);
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  static async updateChatHistory(sessionId, chatHistory) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE sessions 
         SET chat_history = ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE session_id = ?`,
        [JSON.stringify(chatHistory), sessionId],
        (err) => {
          if (err) {
            console.error('Update chat history error:', err);
            reject(err);
            return;
          }
          resolve(true);
        }
      );
    });
  }

  static async getUserSessions(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC',
        [userId],
        (err, rows) => {
          if (err) {
            console.error('Get user sessions error:', err);
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
  }

  static async deleteSession(sessionId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM sessions WHERE session_id = ?',
        [sessionId],
        (err) => {
          if (err) {
            console.error('Delete session error:', err);
            reject(err);
            return;
          }
          resolve(true);
        }
      );
    });
  }
}

module.exports = Session;
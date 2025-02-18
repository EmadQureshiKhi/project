const sqlite3 = require('sqlite3').verbose();

class SqliteCache {
    constructor() {
        this.db = new sqlite3.Database(':memory:');
        this.init();
    }

    init() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT,
                timestamp INTEGER
            )
        `);
    }

    async set(key, value, ttl = 3600) {
        return new Promise((resolve, reject) => {
            const timestamp = Date.now() + (ttl * 1000);
            this.db.run(
                'INSERT OR REPLACE INTO cache (key, value, timestamp) VALUES (?, ?, ?)',
                [key, value, timestamp],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT value FROM cache WHERE key = ? AND timestamp > ?',
                [key, Date.now()],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.value : null);
                }
            );
        });
    }
}

module.exports = { SqliteCache };
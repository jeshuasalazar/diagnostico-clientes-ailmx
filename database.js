const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'diagnosticos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    db.run(`
      CREATE TABLE IF NOT EXISTS diagnosticos (
        id TEXT PRIMARY KEY,
        empresa TEXT NOT NULL,
        giro TEXT NOT NULL,
        nombre_contacto TEXT,
        cargo TEXT,
        consultor TEXT,
        fecha TEXT,
        datos_completos TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (createErr) => {
      if (createErr) {
        console.error('Error creating table:', createErr.message);
      } else {
        console.log('diagnosticos table ready.');
      }
    });
  }
});

// Helper wrapper functions using Promises for clean async/await syntax
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};

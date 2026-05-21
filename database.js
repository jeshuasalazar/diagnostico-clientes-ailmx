const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'diagnosticos.db');

// Si la base de datos está configurada en un volumen persistente (ej: /data/diagnosticos.db)
// y no existe aún, pero tenemos una base de datos sembrada en la raíz, la copiamos al volumen.
if (process.env.DATABASE_PATH) {
  const targetDir = path.dirname(process.env.DATABASE_PATH);
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    if (!fs.existsSync(process.env.DATABASE_PATH)) {
      const rootDbPath = path.resolve(__dirname, 'diagnosticos.db');
      if (fs.existsSync(rootDbPath)) {
        console.log('Copiando base de datos sembrada de la raíz al volumen persistente...');
        fs.copyFileSync(rootDbPath, process.env.DATABASE_PATH);
        console.log('Base de datos sembrada copiada con éxito.');
      }
    }
  } catch (err) {
    console.error('Error al migrar la base de datos al volumen:', err.message);
  }
}

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

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { dbRun, dbGet, dbAll } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and urlencoded requests with appropriate limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic Authentication Middleware to protect consultant dashboard and edit actions
const authMiddleware = (req, res, next) => {
  const path = req.path;
  const method = req.method;

  let isProtected = false;

  if (path === '/' || path === '/index.html') {
    isProtected = true;
  } else if (path === '/api/diagnosticos') {
    isProtected = true; // GET list all, POST new
  } else if (path.startsWith('/api/diagnosticos/')) {
    // /api/diagnosticos/:id -> GET details is public, PUT and DELETE are protected
    if (method === 'PUT' || method === 'DELETE') {
      isProtected = true;
    }
  }

  if (isProtected) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.setHeader('WWW-Authenticate', 'Basic realm="aiLearning Onboarding Portal"');
      return res.status(401).send('Authentication required.');
    }

    try {
      const token = authHeader.split(' ')[1];
      const credentials = Buffer.from(token, 'base64').toString('ascii').split(':');
      const username = credentials[0];
      const password = credentials[1];

      // Default credentials if not configured in environment variables
      const expectedUser = process.env.ADMIN_USER || 'admin';
      const expectedPass = process.env.ADMIN_PASS || 'ailearning2026';

      if (username === expectedUser && password === expectedPass) {
        return next();
      }
    } catch (e) {
      // Fall through to unauthorized
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="aiLearning Onboarding Portal"');
    return res.status(401).send('Invalid credentials.');
  }

  next();
};

app.use(authMiddleware);

// Serve static assets out of the public folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// 1. Get all diagnostics (list for consultant panel)
app.get('/api/diagnosticos', async (req, res) => {
  try {
    const rows = await dbAll('SELECT id, empresa, giro, nombre_contacto, cargo, consultor, fecha, created_at FROM diagnosticos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching list:', err.message);
    res.status(500).json({ error: 'Error al obtener la lista de diagnósticos.' });
  }
});

// 2. Get single diagnostic by ID
app.get('/api/diagnosticos/:id', async (req, res) => {
  try {
    const row = await dbGet('SELECT * FROM diagnosticos WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado.' });
    }
    // Parse the JSON string containing all detailed questions/calculations
    row.datos_completos = JSON.parse(row.datos_completos);
    res.json(row);
  } catch (err) {
    console.error('Error fetching diagnostic:', err.message);
    res.status(500).json({ error: 'Error al obtener el diagnóstico.' });
  }
});

// 3. Create a new diagnostic
app.post('/api/diagnosticos', async (req, res) => {
  try {
    const { empresa, giro, nombre_contacto, cargo, consultor, fecha, datos_completos } = req.body;
    
    if (!empresa || !giro) {
      return res.status(400).json({ error: 'Los campos empresa y giro son obligatorios.' });
    }

    const id = uuidv4();
    const datosJson = JSON.stringify(datos_completos || {});

    await dbRun(
      `INSERT INTO diagnosticos (id, empresa, giro, nombre_contacto, cargo, consultor, fecha, datos_completos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, empresa, giro, nombre_contacto, cargo, consultor, fecha, datosJson]
    );

    res.status(201).json({ id, message: 'Diagnóstico creado con éxito.' });
  } catch (err) {
    console.error('Error creating diagnostic:', err.message);
    res.status(500).json({ error: 'Error al crear el diagnóstico.' });
  }
});

// 4. Update an existing diagnostic
app.put('/api/diagnosticos/:id', async (req, res) => {
  try {
    const { empresa, giro, nombre_contacto, cargo, consultor, fecha, datos_completos } = req.body;
    const id = req.params.id;

    const row = await dbGet('SELECT id FROM diagnosticos WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado.' });
    }

    if (!empresa || !giro) {
      return res.status(400).json({ error: 'Los campos empresa y giro son obligatorios.' });
    }

    const datosJson = JSON.stringify(datos_completos || {});

    await dbRun(
      `UPDATE diagnosticos 
       SET empresa = ?, giro = ?, nombre_contacto = ?, cargo = ?, consultor = ?, fecha = ?, datos_completos = ?
       WHERE id = ?`,
      [empresa, giro, nombre_contacto, cargo, consultor, fecha, datosJson, id]
    );

    res.json({ message: 'Diagnóstico actualizado con éxito.' });
  } catch (err) {
    console.error('Error updating diagnostic:', err.message);
    res.status(500).json({ error: 'Error al actualizar el diagnóstico.' });
  }
});

// 5. Delete a diagnostic
app.delete('/api/diagnosticos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const row = await dbGet('SELECT id FROM diagnosticos WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado.' });
    }

    await dbRun('DELETE FROM diagnosticos WHERE id = ?', [id]);
    res.json({ message: 'Diagnóstico eliminado con éxito.' });
  } catch (err) {
    console.error('Error deleting diagnostic:', err.message);
    res.status(500).json({ error: 'Error al eliminar el diagnóstico.' });
  }
});

// Serve frontend client routing fallback (direct shareable UUID link)
app.get('/cliente/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cliente.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

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
        // Auto-sembrado autocurativo si la base de datos está vacía
        db.get('SELECT COUNT(*) as count FROM diagnosticos', (countErr, row) => {
          if (!countErr && row && row.count === 0) {
            console.log('Base de datos vacía. Iniciando sembrado automático de alta fidelidad...');
            
            const seedData = [
              {
                id: "8b4c09d5-4a6c-4828-9d46-49f3238ab201",
                empresa: "Despacho Contable Guadalajara S.C.",
                giro: "Servicios Profesionales / Contabilidad",
                nombre_contacto: "Carlos Mendoza",
                cargo: "Socio Director / CFO",
                consultor: "Sebastián AI",
                fecha: "2026-05-21",
                datos_completos: {
                  ciudad: "Guadalajara, Jalisco",
                  operando: "5",
                  empleadosTotal: "45",
                  empleadosAdmin: "15",
                  ticket: "15000",
                  transacciones: "120",
                  facturacion: "1800000",
                  metaFacturacion: "2500000",
                  channels: ["WhatsApp", "Email", "Recomendaciones"],
                  crm: "Ninguno (Excel)",
                  erp: "CONTPAQi",
                  checkedBots: ["Captura de Datos", "Generación de Reportes"],
                  custRefCase: "Automatización de Reportes Financieros en Despachos de Servicios",
                  custMetric: "Tiempo en generación de reportes mensuales",
                  custReplace: "Extracción manual desde CONTPAQi y formateo manual en Excel",
                  pain1: {
                    name: "Estructura manual de reportes financieros",
                    hours: "5",
                    persons: "15",
                    costHr: "250",
                    leads: "0",
                    ticket: "0",
                    errors: "10",
                    tool: "Excel + Carga Manual"
                  },
                  pain2: {
                    name: "Captura y conciliación de facturas en ERP",
                    hours: "8",
                    persons: "8",
                    costHr: "180",
                    leads: "0",
                    ticket: "0",
                    errors: "15",
                    tool: "Captura Manual una por una"
                  },
                  prio1: {
                    crit: "5",
                    speed: "4",
                    hours: "5",
                    errors: "4"
                  },
                  prio2: {
                    crit: "4",
                    speed: "5",
                    hours: "4",
                    errors: "3"
                  },
                  sprintChoice: "sprint1",
                  roi: {
                    leadsRec: "0",
                    marginNet: "100000",
                    riskEvited: "50000",
                    sprintFee: "70000"
                  },
                  offer: {
                    solutionName: "Sistema Inteligente de Conciliación y Reportes Financieros",
                    tools: ["Make (Integromat)", "OpenAI Assistants API", "Google Sheets API"],
                    agentStack: ["Agente Extractor de XMLs", "Agente Conciliador de Cuentas", "Generador Automático de Reportes"],
                    metricName: "Horas semanales dedicadas a reportes por consultor",
                    metricBase: "5 horas",
                    metricGoal: "1 hora",
                    sigConsultor: "Sebastián AI / aiLearning",
                    sigCliente: "Carlos Mendoza / Despacho Guadalajara"
                  }
                }
              },
              {
                id: "f25e76a3-7649-43c3-9d41-419b7d87bc42",
                empresa: "Clínica Dental Solutions",
                giro: "Salud y Bienestar / Dental",
                nombre_contacto: "Dra. Sofía Garza",
                cargo: "Directora Médica",
                consultor: "Elena Gómez",
                fecha: "2026-05-20",
                datos_completos: {
                  ciudad: "Monterrey, Nuevo León",
                  operando: "3",
                  empleadosTotal: "12",
                  empleadosAdmin: "3",
                  ticket: "3500",
                  transacciones: "280",
                  facturacion: "980000",
                  metaFacturacion: "1500000",
                  channels: ["Instagram", "WhatsApp", "Llamadas"],
                  crm: "Dentalink",
                  erp: "Ninguno",
                  checkedBots: ["Agendador por WhatsApp", "Recordatorios Automatizados"],
                  custRefCase: "Optimización de Agenda Médica y Seguimiento de Pacientes con IA",
                  custMetric: "Tasa de ausentismo de pacientes y leads perdidos",
                  custReplace: "Secretarias llamando manualmente y confirmando citas por WhatsApp uno a uno",
                  pain1: {
                    name: "Agendamiento manual y confirmación de citas",
                    hours: "12",
                    persons: "3",
                    costHr: "150",
                    leads: "0",
                    ticket: "0",
                    errors: "18",
                    tool: "Mensajes manuales de WhatsApp"
                  },
                  pain2: {
                    name: "Falta de seguimiento a leads de redes sociales",
                    hours: "6",
                    persons: "3",
                    costHr: "150",
                    leads: "45",
                    ticket: "3500",
                    errors: "25",
                    tool: "Chat de Instagram sin CRM integrado"
                  },
                  prio1: {
                    crit: "5",
                    speed: "5",
                    hours: "5",
                    errors: "4"
                  },
                  prio2: {
                    crit: "4",
                    speed: "4",
                    hours: "3",
                    errors: "5"
                  },
                  sprintChoice: "sprint2",
                  roi: {
                    leadsRec: "15",
                    marginNet: "80000",
                    riskEvited: "30000",
                    sprintFee: "50000"
                  },
                  offer: {
                    solutionName: "Recepción Digital Autónoma y Nutrición de Pacientes",
                    tools: ["ManyChat", "Make", "Airtable", "WhatsApp Cloud API"],
                    agentStack: ["Agente Calificador de Leads", "Agente Confirmador de Citas", "Agente de Reactivación de Pacientes Dormidos"],
                    metricName: "Tasa de confirmación de citas y recuperación de leads",
                    metricBase: "65%",
                    metricGoal: "90%",
                    sigConsultor: "Elena Gómez / aiLearning",
                    sigCliente: "Dra. Sofía Garza / Dental Solutions"
                  }
                }
              }
            ];

            const stmt = db.prepare(`
              INSERT INTO diagnosticos (id, empresa, giro, nombre_contacto, cargo, consultor, fecha, datos_completos)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            seedData.forEach((d) => {
              const datosJson = JSON.stringify(d.datos_completos);
              stmt.run(d.id, d.empresa, d.giro, d.nombre_contacto, d.cargo, d.consultor, d.fecha, datosJson, (insErr) => {
                if (insErr) {
                  console.error('Error en sembrado automático:', insErr.message);
                } else {
                  console.log(`Sembrado exitoso: ${d.empresa}`);
                }
              });
            });

            stmt.finalize();
          }
        });
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

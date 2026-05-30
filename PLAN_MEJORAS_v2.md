# Plan de Implementación de Mejoras — Diagnóstico aiLearning 2.0 → 3.0

**Fecha:** 29 de mayo de 2026  
**Infraestructura base:** Node.js + Express + SQLite + Vanilla JS (sin cambio de stack)  
**Objetivo:** Mayor velocidad de captura, diagnóstico más preciso y adaptable por sector, y resultados gráficos de alto impacto para el cliente.

---

## Diagnóstico del Estado Actual

| Componente | Situación actual | Impacto en UX |
|---|---|---|
| Flujo del formulario | 7 pasos lineales, navegación manual | Lento — consultor tarda 35-45 min en llenarlo |
| Captura de dolores | Solo 2 pain points fijos | Diagnóstico incompleto para negocios complejos |
| Adaptación por sector | `VERTICALS_DB` con 9 sectores, pero UI idéntica para todos | No aprovecha la inteligencia sectorial ya disponible |
| Cálculos ROI | Fórmulas correctas pero sin benchmarks ni rangos | El cliente no puede contextualizar si su ROI es bueno o malo |
| Vista del cliente | 1 gráfico radar + texto plano | Bajo impacto visual; difícil de "vender" internamente |
| Exportación PDF | html2pdf captura un div oculto | Calidad variable; no es branded |
| Base de datos | Un solo campo `datos_completos` JSON | Sin métricas indexadas para comparar diagnósticos |
| Compartir resultados | URL directa `/cliente/:id` | No hay botón de WhatsApp share ni QR |

---

## FASE 1 — Experiencia del Consultor: De 7 pasos a 3 fases inteligentes
**Tiempo estimado de implementación: 4-5 días**  
**Archivo principal a modificar:** `public/js/app.js`, `public/index.html`

### 1.1 Smart Wizard de 3 Fases con Progressive Disclosure

Colapsar los 7 pasos actuales en 3 fases que fluyen más naturalmente:

```
FASE A — Contexto del Negocio (2 min)
  └─ Datos generales + Vertical (auto-carga sector)
  └─ Indicadores comerciales (ticket, facturación, empleados)
  └─ Herramientas actuales (CRM, ERP, canales)

FASE B — Diagnóstico Operativo (10-15 min)
  └─ Selección de cuellos de botella (checklist con sugerencias por vertical)
  └─ Captura de 2 a 4 pain points (dinámico — botón "+ Agregar proceso")
  └─ Cuantificación en línea con cálculo en tiempo real visible
  └─ Priorización con sliders visuales (no inputs de texto)

FASE C — Propuesta Comercial (5 min)
  └─ Selección del sprint ganador (auto-sugiere el de mayor puntaje)
  └─ Stack tecnológico por vertical (auto-pre-selección)
  └─ ROI y TCO con campos editables
  └─ Nombre de la solución + métricas de éxito
```

**Cambio clave en `app.js`:** Reemplazar `showStep(n)` por `showPhase('A'|'B'|'C')` con estado persistido en `sessionStorage`.

### 1.2 Auto-fill Sectorial al Seleccionar Vertical

Cuando el consultor selecciona el `giro`, el sistema debe:
1. Pre-seleccionar los 3 cuellos de botella más comunes del sector (del `VERTICALS_DB`)
2. Pre-llenar el campo "Caso de referencia" con `refCase` del vertical
3. Establecer el `metricName` y `metricGoal` según el vertical
4. Mostrar solo las herramientas del stack relevantes al sector

```javascript
// En app.js — nueva función
function onVerticalSelect(verticalKey) {
  const v = VERTICALS_DB[verticalKey];
  if (!v) return;
  
  // Auto-check los 3 primeros bottlenecks del sector
  v.bottlenecks.slice(0, 3).forEach(b => autoCheckBottleneck(b));
  
  // Pre-fill campos de referencia
  setField('f-custRefCase', v.refCase);
  setField('f-custMetric', v.metric);
  
  // Mostrar benchmarks del sector (nuevo elemento UI)
  renderSectorBenchmarks(verticalKey);
}
```

### 1.3 Calculadora en Tiempo Real (Inline)

Cada pain point debe mostrar el costo calculado **mientras el consultor escribe**, sin necesidad de ir al paso 7:

```javascript
// Agregar listener a todos los inputs de pain1/pain2/pain3/pain4
['hours','persons','costHr','leads','ticket','errors'].forEach(field => {
  document.getElementById(`pain1-${field}`).addEventListener('input', () => {
    const res = aiFormulas.calcularCostoDolor(getPain1Inputs());
    document.getElementById('pain1-inline-total').textContent = 
      `$${Math.round(res.total).toLocaleString()} MXN/año`;
  });
});
```

### 1.4 Captura Dinámica: De 2 a 4 Pain Points

Agregar botón `+ Agregar otro proceso` que crea pain3 y pain4 dinámicamente. El schema de `datos_completos` ya soporta JSON libre, solo agregar la UI y actualizar `formulas.js` para sumar todos los dolores.

---

## FASE 2 — Motor de Diagnóstico Adaptativo por Sector
**Tiempo estimado: 3-4 días**  
**Archivos principales: `public/js/formulas.js`, nuevo archivo `public/js/benchmarks.js`**

### 2.1 Crear `benchmarks.js` — Base de Referencia por Sector

Nuevo archivo que añade contexto comparativo al diagnóstico:

```javascript
const SECTOR_BENCHMARKS = {
  Legal: {
    ticketPromedio: [15000, 80000],      // Rango MXN típico del sector
    transaccionesMes: [20, 80],
    horasManualTipicas: 25,              // Hrs/sem en tareas repetitivas promedio sector
    roiEsperado: [180, 400],             // % ROI típico de automatización en este sector
    quickWins: ["Análisis de contratos RAG", "Redacción asistida", "Alertas de vencimientos"],
    stackSugerido: ["Claude API", "Make.com", "Notion/RAG"],
    tiempoPayback: 2.5                   // Meses promedio de payback en el sector
  },
  Contabilidad: {
    ticketPromedio: [8000, 30000],
    transaccionesMes: [60, 200],
    horasManualTipicas: 35,
    roiEsperado: [200, 500],
    quickWins: ["OCR de XMLs/SAT", "Conciliación bancaria auto", "Recordatorios documentos"],
    stackSugerido: ["Make.com", "CONTPAQi API", "OpenAI GPT-4o"],
    tiempoPayback: 1.8
  },
  Consultoria: {
    ticketPromedio: [25000, 150000],
    transaccionesMes: [10, 50],
    horasManualTipicas: 20,
    roiEsperado: [150, 350],
    quickWins: ["Generador de propuestas", "Calificación de leads WA", "Reportes automáticos"],
    stackSugerido: ["Make.com", "WhatsApp Cloud API", "Airtable"],
    tiempoPayback: 2.0
  },
  Clinicas: {
    ticketPromedio: [1500, 12000],
    transaccionesMes: [150, 500],
    horasManualTipicas: 30,
    roiEsperado: [200, 450],
    quickWins: ["Agendador WA automático", "Recordatorios de citas", "Reactivación de pacientes"],
    stackSugerido: ["ManyChat", "WhatsApp Cloud API", "Airtable"],
    tiempoPayback: 1.5
  },
  Inmobiliarias: {
    ticketPromedio: [50000, 500000],
    transaccionesMes: [5, 30],
    horasManualTipicas: 40,
    roiEsperado: [300, 800],
    quickWins: ["Calificador de leads portales", "Reactivación base fría", "Fichas técnicas auto"],
    stackSugerido: ["Make.com", "HubSpot", "WhatsApp Cloud API"],
    tiempoPayback: 1.2
  }
  // ... resto de sectores
};
```

### 2.2 Score de Confianza del Diagnóstico

Agregar un indicador visual que muestre qué tan completo y preciso es el diagnóstico según los datos ingresados:

```javascript
function calcularConfianzaDiagnostico(dc, vertical) {
  let score = 0;
  const bench = SECTOR_BENCHMARKS[vertical] || {};
  
  // Completitud de datos (50 pts)
  if (dc.ticket) score += 10;
  if (dc.facturacion) score += 10;
  if (dc.pain1?.hours && dc.pain1?.persons && dc.pain1?.costHr) score += 15;
  if (dc.pain2?.hours) score += 10;
  if (dc.checkedBots?.length >= 2) score += 5;
  
  // Coherencia con benchmarks del sector (50 pts)
  const ticket = parseFloat(dc.ticket);
  if (bench.ticketPromedio) {
    const [min, max] = bench.ticketPromedio;
    if (ticket >= min && ticket <= max) score += 20;
    else if (ticket > 0) score += 10; // al menos tiene valor
  }
  
  const horas = parseFloat(dc.pain1?.hours);
  if (bench.horasManualTipicas) {
    if (horas >= bench.horasManualTipicas * 0.3) score += 30;
  }
  
  return Math.min(score, 100);
}
```

Mostrar como barra de progreso circular en el header: `🎯 Precisión del diagnóstico: 87%`

### 2.3 Sugerencia Inteligente del Stack Tecnológico

Cuando se selecciona la vertical, pre-marcar automáticamente las herramientas del stack en el paso 6:

```javascript
function autoSelectStack(verticalKey) {
  const bench = SECTOR_BENCHMARKS[verticalKey];
  if (!bench?.stackSugerido) return;
  
  // Reset todos los checkboxes de stack
  document.querySelectorAll('.tool-checkbox').forEach(cb => cb.checked = false);
  
  // Auto-check los del sector
  const toolMap = {
    "Make.com": "tool-make",
    "Claude API": "tool-claude", 
    "GPT-4o": "tool-gpt",
    "WhatsApp Cloud API": "tool-wa",
    "Notion/RAG": "tool-notion",
    "Airtable": "tool-notion",
    "HubSpot": "tool-hubspot",
    "ManyChat": "tool-manychat"
  };
  
  bench.stackSugerido.forEach(tool => {
    const id = toolMap[tool];
    if (id) {
      const el = document.getElementById(id);
      if (el) el.checked = true;
    }
  });
}
```

---

## FASE 3 — Dashboard del Cliente: Gráficas de Alto Impacto
**Tiempo estimado: 5-6 días**  
**Archivo principal: `public/js/client.js`, `public/cliente.html`**

Esta es la mejora de mayor impacto visual. El cliente debe abrir su reporte y quedar impresionado en los primeros 3 segundos.

### 3.1 Nueva Arquitectura del Dashboard del Cliente

Reemplazar el layout actual (1 radar + texto) con un sistema de 5 secciones gráficas:

```
┌─────────────────────────────────────────────────────┐
│  HERO: Logo + Nombre Empresa + Score de Diagnóstico  │
│  "Tu negocio tiene un potencial de $XXX,XXX MXN/año" │
└─────────────────────────────────────────────────────┘

┌───────────────┬───────────────┬───────────────┬──────┐
│  💰 Costo     │  🚀 Beneficio │  📈 ROI        │ ⏱️   │
│  del Dolor    │  Anual        │  del Proyecto  │ Payback│
│  $XXX,XXX MXN │  $XXX,XXX MXN │  XXX%          │ X.X m│
│  [Animado]    │  [Animado]    │  [Gauge verde] │      │
└───────────────┴───────────────┴───────────────┴──────┘

┌─────────────────────────────┬───────────────────────┐
│  GRÁFICA: Waterfall de      │  RADAR: Priorización  │
│  Beneficios (Barras apiladas│  Proceso 1 vs 2       │
│  Tiempo / Ventas / Riesgo)  │  (Existente, mejorado)│
└─────────────────────────────┴───────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TIMELINE: Sprint de 3 Semanas (Gantt visual)       │
│  Sem 1: Auditoría │ Sem 2: Desarrollo │ Sem 3: Piloto│
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CTA: Botones de Acción                             │
│  [📲 Compartir por WhatsApp] [📄 Descargar PDF]    │
└─────────────────────────────────────────────────────┘
```

### 3.2 Implementar Gauge de ROI (Chart.js Doughnut)

```javascript
function renderGaugeROI(roiPercent) {
  const ctx = document.getElementById('roi-gauge-chart').getContext('2d');
  
  // Escalar: 0-500% ROI → 0-100% del gauge
  const fillPercent = Math.min(roiPercent / 5, 100);
  const color = roiPercent >= 200 ? '#6B9080' : roiPercent >= 100 ? '#4979EC' : '#FF6B47';
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [fillPercent, 100 - fillPercent],
        backgroundColor: [color, '#1e1e2e'],
        circumference: 180,
        rotation: 270,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw(chart) {
        const { ctx, chartArea: { top, width, height } } = chart;
        ctx.save();
        ctx.font = 'bold 28px Space Grotesk';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(`${roiPercent.toLocaleString()}%`, width / 2, top + height * 0.75);
        ctx.font = '13px Inter';
        ctx.fillStyle = '#6E6E7E';
        ctx.fillText('ROI Año 1', width / 2, top + height * 0.90);
        ctx.restore();
      }
    }]
  });
}
```

### 3.3 Waterfall / Barra Apilada de Beneficios (Chart.js Bar)

```javascript
function renderWaterfallBeneficios(roiRes) {
  const ctx = document.getElementById('benefits-waterfall-chart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ahorro\nTiempo-Hombre', 'Ingresos\nExtra', 'Riesgo\nEvitado', 'Total\nBeneficios'],
      datasets: [{
        label: 'Beneficio Anual (MXN)',
        data: [
          roiRes.ahorroTiempo,
          roiRes.ingresosExtra,
          roiRes.riesgoEvitado,
          roiRes.totalBeneficios
        ],
        backgroundColor: [
          'rgba(73, 121, 236, 0.8)',
          'rgba(107, 144, 128, 0.8)',
          'rgba(255, 193, 77, 0.8)',
          'rgba(73, 121, 236, 1.0)'
        ],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `$${Math.round(ctx.raw).toLocaleString()} MXN/año`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `$${(v/1000).toFixed(0)}K`
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}
```

### 3.4 Timeline Visual del Sprint (HTML/CSS puro)

```javascript
function renderSprintTimeline() {
  const phases = [
    { 
      week: "Semana 1", 
      label: "Auditoría & Diseño",
      days: "Días 1–5",
      tasks: ["Gemba remoto", "Mapeo BPMN 2.0", "Blueprint técnico"],
      color: "var(--brand)"
    },
    { 
      week: "Semana 2", 
      label: "Desarrollo MVP",
      days: "Días 6–10",
      tasks: ["Configuración Make/n8n", "Conexión APIs", "Pruebas internas"],
      color: "var(--sage)"
    },
    {
      week: "Semana 3",
      label: "Piloto & Capacitación",
      days: "Días 11–15",
      tasks: ["ADKAR training", "Despliegue piloto", "KPIs y entrega"],
      color: "var(--coral)"
    }
  ];
  
  const container = document.getElementById('sprint-timeline');
  container.innerHTML = phases.map((p, i) => `
    <div class="timeline-phase" style="border-top: 3px solid ${p.color}">
      <div class="timeline-week" style="color:${p.color}">${p.week}</div>
      <div class="timeline-days">${p.days}</div>
      <strong>${p.label}</strong>
      <ul>
        ${p.tasks.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  `).join('<div class="timeline-arrow">→</div>');
}
```

### 3.5 KPIs con Animación de Conteo

```javascript
function animateKPI(elementId, targetValue, prefix = '$', suffix = ' MXN') {
  const el = document.getElementById(elementId);
  const duration = 1500;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetValue);
    el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
```

### 3.6 Botón de Compartir por WhatsApp

```javascript
function shareOnWhatsApp(diag) {
  const diagUrl = `${window.location.origin}/cliente/${diag.id}`;
  const roi = document.getElementById('dash-roi-percent').textContent;
  const empresa = diag.empresa;
  
  const msg = encodeURIComponent(
    `📊 *Diagnóstico de IA — ${empresa}*\n\n` +
    `Tu reporte de automatización está listo.\n` +
    `ROI proyectado: *${roi}* en el primer año.\n\n` +
    `Ver reporte completo:\n${diagUrl}\n\n` +
    `_aiLearning — Conecta clientes con tu Empresa_`
  );
  
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}
```

---

## FASE 4 — Backend: Schema Extendido y Analytics
**Tiempo estimado: 2-3 días**  
**Archivos: `database.js`, `server.js`**

### 4.1 Migración del Schema de SQLite

Agregar columnas computadas para habilitar analytics y búsqueda sin deserializar el JSON:

```sql
ALTER TABLE diagnosticos ADD COLUMN vertical TEXT;
ALTER TABLE diagnosticos ADD COLUMN roi_percent REAL;
ALTER TABLE diagnosticos ADD COLUMN score_priorizacion REAL;
ALTER TABLE diagnosticos ADD COLUMN costo_dolor_total REAL;
ALTER TABLE diagnosticos ADD COLUMN sprint_fee REAL;
ALTER TABLE diagnosticos ADD COLUMN confianza_diagnostico INTEGER;
```

**Actualizar el `POST /api/diagnosticos`** para poblar estos campos al momento de guardar:

```javascript
// En server.js — al crear/actualizar diagnóstico
const aiFormulas = require('./public/js/formulas');
const { calcularROI, calcularPriorizacion, calcularCostoDolor } = aiFormulas;

const roiRes = calcularROI({...});
const score1 = calcularPriorizacion(datos.prio1 || {});

await dbRun(
  `INSERT INTO diagnosticos 
   (id, empresa, giro, vertical, nombre_contacto, cargo, consultor, fecha, datos_completos,
    roi_percent, score_priorizacion, costo_dolor_total, sprint_fee, confianza_diagnostico)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  [id, empresa, giro, giro.split('/')[0].trim(), nombre_contacto, cargo, consultor, fecha,
   datosJson, roiRes.roiPercent, score1, painTotal, datos.roi?.sprintFee || 60000, confianza]
);
```

### 4.2 Nuevo Endpoint de Analytics

```javascript
// GET /api/analytics — Resumen estadístico del portafolio
app.get('/api/analytics', async (req, res) => {
  const stats = await dbGet(`
    SELECT 
      COUNT(*) as total,
      AVG(roi_percent) as roi_promedio,
      SUM(costo_dolor_total) as dolor_total_portafolio,
      AVG(sprint_fee) as ticket_promedio,
      MAX(roi_percent) as mejor_roi,
      MIN(created_at) as primer_diagnostico
    FROM diagnosticos
  `);
  
  const por_vertical = await dbAll(`
    SELECT vertical, COUNT(*) as count, AVG(roi_percent) as roi_prom
    FROM diagnosticos
    GROUP BY vertical
    ORDER BY count DESC
  `);
  
  res.json({ stats, por_vertical });
});

// GET /api/export-csv — Exportar todos los diagnósticos
app.get('/api/export-csv', async (req, res) => {
  const rows = await dbAll(`
    SELECT empresa, giro, nombre_contacto, cargo, consultor, fecha,
           roi_percent, score_priorizacion, costo_dolor_total, sprint_fee
    FROM diagnosticos ORDER BY created_at DESC
  `);
  
  const csv = [
    'Empresa,Giro,Contacto,Cargo,Consultor,Fecha,ROI%,Score,Costo Dolor,Sprint Fee',
    ...rows.map(r => Object.values(r).join(','))
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=diagnosticos_ailearning.csv');
  res.send(csv);
});
```

---

## FASE 5 — Mejoras de PDF y Branding
**Tiempo estimado: 2 días**  
**Archivo: `public/js/client.js`**

### 5.1 Reemplazar html2pdf por Puppeteer en el Backend

La exportación actual captura un `div` oculto con calidad variable. Mover la generación al servidor:

```javascript
// Instalar: npm install puppeteer
// Nuevo endpoint en server.js
const puppeteer = require('puppeteer');

app.get('/api/diagnosticos/:id/pdf', async (req, res) => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const diagUrl = `http://localhost:${PORT}/cliente/${req.params.id}`;
  await page.goto(diagUrl, { waitUntil: 'networkidle0' });
  
  // Esperar a que Chart.js renderice los gráficos
  await page.waitForTimeout(1500);
  
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
  });
  
  await browser.close();
  
  const empresa = (await dbGet('SELECT empresa FROM diagnosticos WHERE id=?', [req.params.id]))?.empresa || 'Empresa';
  const cleanName = empresa.replace(/[^a-zA-Z0-9]/g, '_');
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=aiLearning_${cleanName}.pdf`);
  res.send(pdfBuffer);
});
```

**Botón en cliente.html:**
```html
<a href="/api/diagnosticos/{{id}}/pdf" class="btn btn-primary">
  📄 Descargar PDF
</a>
```

---

## Roadmap de Implementación

| Fase | Descripción | Días | Prioridad | Impacto |
|---|---|---|---|---|
| **1** | Smart Wizard + Auto-fill sectorial | 4-5 días | 🔴 Alta | Velocidad del consultor: -60% tiempo |
| **2** | benchmarks.js + Score de confianza | 3-4 días | 🔴 Alta | Precisión diagnóstico: +40% |
| **3** | Dashboard cliente con 5 gráficas | 5-6 días | 🔴 Alta | Impacto visual: ★★★★★ |
| **4** | Schema DB extendido + Analytics | 2-3 días | 🟡 Media | Visibilidad del portafolio |
| **5** | PDF con Puppeteer + WhatsApp share | 2 días | 🟡 Media | Cierre de ventas más rápido |

**Total estimado: 16-20 días de desarrollo solo**  
**Secuencia recomendada:** Fase 3 → Fase 1 → Fase 2 → Fase 4 → Fase 5

> **Nota:** Comenzar por Fase 3 (dashboard del cliente) porque es lo que el cliente ve y lo que más acelera el cierre. El consultor puede seguir usando el flujo actual mientras la UX se mejora en paralelo.

---

## Archivos a Crear / Modificar

| Archivo | Acción | Descripción |
|---|---|---|
| `public/js/benchmarks.js` | **Crear** | Base de benchmarks por sector |
| `public/js/formulas.js` | **Modificar** | Agregar `calcularConfianza()`, soporte pain3/pain4 |
| `public/js/app.js` | **Refactorizar** | Smart Wizard 3 fases, auto-fill sectorial |
| `public/js/client.js` | **Refactorizar** | 5 gráficas, animaciones, WhatsApp share |
| `public/cliente.html` | **Modificar** | Nueva estructura del dashboard |
| `public/index.html` | **Modificar** | Nuevo layout 3 fases |
| `database.js` | **Modificar** | Nuevas columnas, migración automática |
| `server.js` | **Modificar** | Endpoint analytics, CSV export, PDF Puppeteer |
| `public/js/charts.js` | **Crear** | Módulo dedicado a Chart.js (gauge, waterfall, timeline) |

---

## Resultado Final Esperado

- **Tiempo de captura del consultor:** De ~40 min → ~15 min
- **Adaptación por sector:** 9 sectores con stack, benchmarks y quick-wins pre-cargados
- **Pain points capturables:** De 2 → hasta 4
- **Gráficas en el reporte del cliente:** De 1 → 5 (gauge ROI, waterfall beneficios, radar priorización, timeline sprint, KPIs animados)
- **Precisión del diagnóstico:** Validación con benchmarks del sector + score de confianza
- **Compartir:** Botón WhatsApp nativo + PDF generado por servidor
- **Analytics del portafolio:** Endpoint `/api/analytics` con ROI promedio, clientes por vertical, ticket promedio

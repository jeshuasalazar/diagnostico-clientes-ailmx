/**
 * app.js
 * Lógica de interacción del consultor para el Diagnóstico aiLearning.
 */

// Estado global de la sesión
let currentDiagId = null;
let priorityChart = null;

// Diccionario de Vertiles y Cuellos de Botella (Basado en la metodología aiLearning)
const VERTICALS_DB = {
  Legal: {
    label: "⚖️ Despachos Legales / Abogados",
    refCase: "Destácame (Vambe AI) — Automatizó 100% de atención; ahorro de 1 FTE junior.",
    metric: "Tiempo de revisión (meta: de horas ➔ <30 min por expediente)",
    replace: "Abogado junior o asistente ($18,000–$35,000 MXN/mes)",
    bottlenecks: [
      "Análisis manual de contratos y documentos — tarda horas por expediente",
      "Due diligence de contratos mercantiles lento (días vs. horas requeridas)",
      "Redacción repetitiva de actas de asamblea, contratos tipo y arrendamientos",
      "Búsqueda manual de cláusulas críticas en tomos documentales",
      "Seguimiento de vencimientos y obligaciones contractuales sin alertas automáticas",
      "Pérdida de prospectos por respuesta lenta a consultas iniciales vía WhatsApp o email"
    ]
  },
  Contabilidad: {
    label: "🧾 Contabilidad / Auditoría / Despachos Fiscales",
    refCase: "OCR Cognitivo (Make.com + Claude) — 80% de carga de pre-captura eliminada.",
    metric: "% documentos procesados sin intervención humana (meta: >80% / mes)",
    replace: "Capturista / asistente contable adicional ($8,000–$15,000 MXN/mes)",
    bottlenecks: [
      "Captura manual de XMLs y PDFs de facturas del SAT (>50 docs/mes)",
      "Conciliaciones bancarias retrasadas por carga de captura manual",
      "Preparación de declaraciones provisionales con datos incompletos o tardíos",
      "Clientes que no envían documentación a tiempo — recordatorios manuales",
      "Errores de captura que generan multas o requerimientos del SAT",
      "Armado de estados financieros que toma days en lugar de horas"
    ]
  },
  Consultoria: {
    label: "💼 Consultoría / Agencias de Servicios / Marketing",
    refCase: "Gestioncar (Vambe AI) — 80 leads/sem calificados y agendados automáticamente.",
    metric: "Tasa de conversión lead ➔ propuesta enviada en <2 hrs (meta: >70%)",
    replace: "SDR o ejecutivo de ventas adicional ($18,000–$35,000 MXN/mes)",
    bottlenecks: [
      "Tiempo excesivo en armar propuestas y cotizaciones (>3 hrs por propuesta)",
      "Leads que se enfrían por respuesta lenta (>24 hrs para primer contacto)",
      "No hay seguimiento automático a prospectos que no contestan de inmediato",
      "Calificación manual de leads — equipo de ventas filtra sin criterio uniforme",
      "Producción lenta de reportes de resultados para clientes",
      "Pérdida de oportunidades por falta de atención fuera de horario comercial"
    ]
  },
  Clinicas: {
    label: "🏥 Clínicas / Consultorios / Estéticas / Spa",
    refCase: "Clibel Estéticas (Vystral) — 70% conversión, 300–400 citas/mes automatizadas.",
    metric: "Tasa conversión lead ➔ cita (meta: >65%) / No-shows (<8%)",
    replace: "Recepcionista adicional ($12,000–$18,000 MXN/mes) + Plataforma",
    bottlenecks: [
      "Agendamiento de citas manual por WhatsApp — recepcionista saturada",
      "No-shows frecuentes por falta de recordatorios automáticos (>15% de citas)",
      "Pérdida de leads fuera de horario por no poder responder de noche o fin de semana",
      "Seguimiento post-consulta / post-tratamiento inexistente o manual",
      "Calificación de leads sin criterio — pacientes no aptos consumen tiempo del médico",
      "Gestión de reseñas en Google Maps sin proceso sistemático"
    ]
  },
  Restaurantes: {
    label: "🍽️ Restaurantes / Alimentos",
    refCase: "Mesón San Diego (NOVAI) — chatbot WhatsApp 24/7 agenda reservas automáticamente.",
    metric: "Ocupación media semanal (+15%) / Reseñas respondidas (100% <24 hrs)",
    replace: "Hostess / recepcionista adicional ($10,000–$15,000 MXN/mes)",
    bottlenecks: [
      "Reservas tomadas solo por teléfono — se pierden cuando está ocupada la línea",
      "Sin sistema de fidelización — no se comunica con clientes que ya asistieron",
      "Pedidos para llevar o a domicilio coordinados manualmente sin confirmación",
      "Gestión de reseñas en Google/TripAdvisor sin proceso automatizado",
      "Campañas de WhatsApp para promover eventos/especiales se hacen a mano",
      "Sin datos de clientes recurrentes — no se sabe quién gasta más"
    ]
  },
  Escuelas: {
    label: "🎓 Escuelas / Centros de Capacitación",
    refCase: "Universidad Adolfo Ibáñez (Vambe AI) — automatización de matrículas en piloto.",
    metric: "Conversión prospecto ➔ inscrito (+30%) / Tiempo contacto (<60 seg)",
    replace: "Asesor de admisiones adicional ($15,000–$25,000 MXN/mes)",
    bottlenecks: [
      "Respuesta lenta a solicitudes de información de prospectos",
      "Proceso de inscripción manual — papelería, pagos y validación a mano",
      "Asesores de admisiones dedicados a responder FAQs (costos, fechas, requisitos)",
      "Seguimiento a prospectos que pidieron información pero no se inscribieron",
      "Comunicación con alumnos actuales (pagos, eventos) manual o dispersa",
      "Sin datos de tasas de conversión por canal de captación"
    ]
  },
  Inmobiliarias: {
    label: "🏗️ Inmobiliarias / Bienes Raíces",
    refCase: "Atrium District (Vystral) — reactivó leads, +40% facturación a $0 CAC.",
    metric: "Tasa respuesta <60 seg (>85%) / Lead ➔ visita calificada (2x)",
    replace: "SDRs ($20,000–$40,000 MXN/mes por persona) o CRM enterprise",
    bottlenecks: [
      "Leads de portales (Inmuebles24, Lamudi) sin respuesta fuera de horario",
      "Base de datos de leads fríos sin reactivación (miles de contactos muertos)",
      "Seguimiento de prospectos asignado sin CRM ni visibilidad central",
      "Visitas agendadas con prospectos no calificados — asesores pierden tiempo",
      "Cotizaciones y fichas técnicas enviadas manualmente por cada asesor",
      "Sin proceso de nutrición de prospectos hasta firma de promesa"
    ]
  },
  Retail: {
    label: "🛒 Retail / E-commerce / Tiendas en Línea",
    refCase: "Reuse (Vambe AI) — expansión a 3 países con chatbot y atención 24/7.",
    metric: "Recuperación de carritos abandonados (meta: >20%) / Conv chat ➔ compra",
    replace: "Agente de atención adicional ($10,000–$18,000 MXN/mes) + Plataforma",
    bottlenecks: [
      "Carritos abandonados sin recuperación automática vía WhatsApp",
      "Atención post-venta (devoluciones, tracking) lenta y manual",
      "Sin sistema de recomendación o upsell al cliente existente",
      "Gestión de inventario y alertas de stock sin automatizar",
      "Campañas de reactivación hechas a mano o inexistentes",
      "Respuestas a FAQs sin chatbot"
    ]
  },
  Otro: {
    label: "⚙️ Otro Giro / Personalizado",
    refCase: "Automatización cognitiva en Make.com — Ahorro estimado de 60% tiempo operativo.",
    metric: "Horas operativas ahorradas a la semana (meta: >15 hrs/sem)",
    replace: "Asistente administrativo / software a medida ($15,000 MXN/mes)",
    bottlenecks: [
      "Respuesta lenta o nula a prospectos entrantes (WhatsApp, email, redes)",
      "Tareas administrativas repetitivas que consumen horas del equipo",
      "Seguimiento manual a clientes o prospectos — oportunidades perdidas",
      "Proceso de cotización, propuesta o contratación lento y centralizado",
      "Falta de visibilidad centralizada del pipeline de ventas",
      "Comunicación interna desorganizada (WhatsApp, hojas de cálculo)"
    ]
  }
};

// Cargar la app al iniciar el documento
document.addEventListener("DOMContentLoaded", () => {
  fetchDiagnosticsList();
  setDefaultDates();
  initPriorityChart();
});

// Colocar la fecha de hoy por defecto

function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  if(document.getElementById('f-fecha')) document.getElementById('f-fecha').value = today;
}

function showStep(stepNum) {
  document.querySelectorAll('.step-pane').forEach(pane => pane.style.display = 'none');
  document.querySelectorAll('.nav-menu .nav-item').forEach(item => item.classList.remove('active'));
  
  const activePane = document.getElementById('pane-step-' + stepNum);
  if (activePane) activePane.style.display = 'block';
  
  const activeNavItem = document.getElementById('nav-step-' + stepNum);
  if (activeNavItem) activeNavItem.classList.add('active');

  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');

  const titles = [
    { title: "Historial de Diagnósticos", sub: "Auditorías Operativas de Inteligencia Artificial" },
    { title: "01. Datos Generales", sub: "Datos Generales del Cliente" },
    { title: "02. Cuantificación del Dolor", sub: "Selección y Costeo de hasta 4 dolores" },
    { title: "03. Pitch Comercial & Sprint", sub: "Priorización, ROI, Oferta y Link de Dashboard" }
  ];

  if (titles[stepNum]) {
    document.getElementById('workspace-title').textContent = titles[stepNum].title;
    document.getElementById('workspace-subtitle').textContent = titles[stepNum].sub;
  }

  const btnSave = document.getElementById('btn-save-diagnostico');
  if(btnSave) btnSave.style.display = stepNum > 0 ? 'inline-flex' : 'none';

  if (stepNum > 0) {
    triggerRecalcs();
  }
}

function handleGiroChange(giro) {
  const notSelectedPane = document.getElementById('vertical-not-selected-message');
  const activePane = document.getElementById('vertical-active-pane');
  if (!giro) {
    if(notSelectedPane) notSelectedPane.style.display = 'block';
    if(activePane) activePane.style.display = 'none';
    return;
  }
  if(notSelectedPane) notSelectedPane.style.display = 'none';
  if(activePane) activePane.style.display = 'flex';
  
  const data = (window.VERTICALS_DB && window.VERTICALS_DB[giro]) ? window.VERTICALS_DB[giro] : (window.VERTICALS_DB && window.VERTICALS_DB['Otro']);
  if(!data) return;

  document.getElementById('active-vertical-label').textContent = data.label;
  
  const container = document.getElementById('bottlenecks-checkboxes-container');
  if(container) {
    container.innerHTML = '';
    data.bottlenecks.forEach((b, idx) => {
      const item = document.createElement('div');
      item.className = 'bottleneck-item';
      item.innerHTML = `<input type="checkbox" id="bot-${idx}" class="bottleneck-check" value="${b}" onchange="handleBottleneckCheckChange()"><div class="bottleneck-content"><span class="bottleneck-text">${b}</span></div>`;
      container.appendChild(item);
    });
  }

  if(document.getElementById('ref-case-text')) document.getElementById('ref-case-text').textContent = data.refCase;
  if(document.getElementById('ref-metric-text')) document.getElementById('ref-metric-text').textContent = data.metric;
  if(document.getElementById('ref-replace-text')) document.getElementById('ref-replace-text').textContent = data.replace;

  if(document.getElementById('cust-ref-case')) document.getElementById('cust-ref-case').value = data.refCase;
  if(document.getElementById('cust-metric')) document.getElementById('cust-metric').value = data.metric;
  if(document.getElementById('cust-replace')) document.getElementById('cust-replace').value = data.replace;

  // Auto-llenado sectorial (Motor Adaptativo)
  const setIfEmpty = (id, val) => {
    const el = document.getElementById(id);
    if(el && !el.value) el.value = val;
  };
  
  setIfEmpty('f-ticket', data.avgTicket);
  setIfEmpty('roi-margin-net', data.avgMargin);
  for(let i=1; i<=4; i++) {
    setIfEmpty(`pain-${i}-cost-hr`, data.avgCostHr);
    setIfEmpty(`pain-${i}-ticket`, data.avgTicket);
  }
  
  triggerRecalcs();
}

function handleBottleneckCheckChange() {
  const checked = Array.from(document.querySelectorAll('.bottleneck-check:checked')).map(c => c.value);
  for(let i=1; i<=4; i++) {
    const el = document.getElementById('pain-'+i+'-name');
    if (el) {
      if (checked[i-1]) el.value = checked[i-1];
    }
  }
  triggerRecalcs();
}

function initPriorityChart() {
  // We no longer have a priority chart in the same way, but it could be added if needed. We ignore it to keep 3 steps simple.
}

function triggerRecalcs() {
  if (typeof aiFormulas === 'undefined') return;

  const getVal = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const getStr = (id) => document.getElementById(id)?.value || "";

  let allPains = [];
  let allScores = [];

  for(let i=1; i<=4; i++) {
    const inputs = {
      horasSemana: getVal('pain-'+i+'-hours'),
      personas: getVal('pain-'+i+'-persons'),
      costoHora: getVal('pain-'+i+'-cost-hr'),
      leadsPerdidosMes: getVal('pain-'+i+'-leads'),
      ticketPromedio: getVal('pain-'+i+'-ticket'),
      erroresMes: getVal('pain-'+i+'-errors'),
      costoSolucionActualMes: getVal('pain-'+i+'-tool')
    };
    const res = aiFormulas.calcularCostoDolor(inputs);
    allPains.push(res);

    const badge = document.getElementById('pain-'+i+'-annual-badge');
    if(badge) badge.textContent = `$${res.total.toLocaleString()} MXN / año`;

    const prioInputs = {
      criticalidad: getVal('prio-'+i+'-crit'),
      velocidadMVP: getVal('prio-'+i+'-speed'),
      liberacionHoras: getVal('prio-'+i+'-hours'),
      mitigacionErrores: getVal('prio-'+i+'-errors')
    };
    const score = aiFormulas.calcularPriorizacion(prioInputs);
    allScores.push(score);

    const scoreEl = document.getElementById('prio-'+i+'-total-score');
    if(scoreEl) scoreEl.textContent = score.toFixed(1);

    const name = getStr('pain-'+i+'-name') || `P${i}`;
    const radioLbl = document.getElementById('lbl-radio-proc'+i);
    if(radioLbl) radioLbl.textContent = `${name} (${score.toFixed(1)})`;
  }

  // Find active sprint process
  const radioChecked = document.querySelector('input[name="selected-sprint-process"]:checked');
  const sprintProcChoice = radioChecked ? parseInt(radioChecked.value) : 1;
  const activePainRes = allPains[sprintProcChoice - 1];
  
  const hrsLiberadas = getVal('pain-'+sprintProcChoice+'-hours') * getVal('pain-'+sprintProcChoice+'-persons') || 0;
  const roiInputs = {
    horasLiberadasSemana: hrsLiberadas,
    costoHora: getVal('pain-'+sprintProcChoice+'-cost-hr'),
    leadsRecuperadosMes: getVal('roi-leads-rec'),
    ticketPromedio: getVal('f-ticket') || getVal('pain-'+sprintProcChoice+'-ticket'),
    margenNetoPercent: getVal('roi-margin-net'),
    costoRiesgoEvitadoAnual: getVal('roi-risk-evited'),
    sprintFee: getVal('roi-sprint-fee')
  };

  const roiRes = aiFormulas.calcularROI(roiInputs);

  if(document.getElementById('res-roi-time-saved')) document.getElementById('res-roi-time-saved').textContent = `$${Math.round(roiRes.ahorroTiempo).toLocaleString()}`;
  if(document.getElementById('res-roi-sales-extra')) document.getElementById('res-roi-sales-extra').textContent = `$${Math.round(roiRes.ingresosExtra).toLocaleString()}`;
  if(document.getElementById('res-roi-risk-avoided')) document.getElementById('res-roi-risk-avoided').textContent = `$${Math.round(roiRes.riesgoEvitado).toLocaleString()}`;
  if(document.getElementById('res-roi-benefits-total')) document.getElementById('res-roi-benefits-total').textContent = `$${Math.round(roiRes.totalBeneficios).toLocaleString()}`;
  if(document.getElementById('res-roi-tco-total')) document.getElementById('res-roi-tco-total').textContent = `$${Math.round(roiRes.tcoTotal).toLocaleString()}`;
  
  const roiValElement = document.getElementById('res-roi-percent-value');
  if(roiValElement) {
    roiValElement.textContent = `${roiRes.roiPercent.toLocaleString()}%`;
    roiValElement.style.color = roiRes.roiPercent >= 100 ? 'var(--sage)' : 'var(--brand-deep)';
  }
  
  if(document.getElementById('res-roi-payback-value')) document.getElementById('res-roi-payback-value').textContent = `${roiRes.paybackMonths} meses`;
  
  // Calcular y Mostrar Score de Confianza
  if(typeof aiFormulas.calcularScoreConfianza === 'function') {
    const confidence = aiFormulas.calcularScoreConfianza(roiInputs);
    const confEl = document.getElementById('confidence-score-badge');
    if(confEl) {
      confEl.textContent = `Score de Confianza: ${Math.round(confidence)}%`;
      confEl.style.backgroundColor = confidence > 80 ? 'var(--sage)' : (confidence > 50 ? 'var(--coral)' : 'var(--error)');
      confEl.style.color = 'white';
    }
  }

  syncPrintData();
}

function syncPrintData() {
  // Para la versión imprimible, mantenemos las funciones básicas, pero como reducimos los pasos, no nos preocuparemos mucho por el print layout que es hidden por ahora a menos que el cliente lo imprima en Dashboard final.
}

function collectFormData() {
  // Same structure but simplified
  const dc = {
    empresa: document.getElementById('f-empresa')?.value,
    giro: document.getElementById('f-giro')?.value,
    contacto: document.getElementById('f-contacto')?.value,
    pains: []
  };

  for(let i=1; i<=4; i++) {
    dc.pains.push({
      name: document.getElementById('pain-'+i+'-name')?.value,
      hours: document.getElementById('pain-'+i+'-hours')?.value,
      persons: document.getElementById('pain-'+i+'-persons')?.value,
      costHr: document.getElementById('pain-'+i+'-cost-hr')?.value,
      leads: document.getElementById('pain-'+i+'-leads')?.value,
      ticket: document.getElementById('pain-'+i+'-ticket')?.value,
      errors: document.getElementById('pain-'+i+'-errors')?.value,
      tool: document.getElementById('pain-'+i+'-tool')?.value,
      crit: document.getElementById('prio-'+i+'-crit')?.value,
      speed: document.getElementById('prio-'+i+'-speed')?.value,
      prioHours: document.getElementById('prio-'+i+'-hours')?.value,
      prioErrors: document.getElementById('prio-'+i+'-errors')?.value
    });
  }
  
  const radioChecked = document.querySelector('input[name="selected-sprint-process"]:checked');
  dc.sprintChoice = radioChecked ? radioChecked.value : "1";
  
  dc.roi = {
    leadsRec: document.getElementById('roi-leads-rec')?.value,
    marginNet: document.getElementById('roi-margin-net')?.value,
    riskEvited: document.getElementById('roi-risk-evited')?.value,
    sprintFee: document.getElementById('roi-sprint-fee')?.value
  };

  return { datos_completos: dc };
}

function populateFormFromData(diag) {
  // basic restore
  currentDiagId = diag.id;
  const dc = diag.datos_completos || {};
  if(dc.empresa) document.getElementById('f-empresa').value = dc.empresa;
  if(dc.giro) {
    document.getElementById('f-giro').value = dc.giro;
    handleGiroChange(dc.giro);
  }
  
  if(dc.pains) {
    for(let i=0; i<4; i++) {
      let p = dc.pains[i];
      if(!p) continue;
      const idx = i+1;
      if(document.getElementById('pain-'+idx+'-name')) document.getElementById('pain-'+idx+'-name').value = p.name || '';
      if(document.getElementById('pain-'+idx+'-hours')) document.getElementById('pain-'+idx+'-hours').value = p.hours || '';
      if(document.getElementById('pain-'+idx+'-persons')) document.getElementById('pain-'+idx+'-persons').value = p.persons || '';
      if(document.getElementById('pain-'+idx+'-cost-hr')) document.getElementById('pain-'+idx+'-cost-hr').value = p.costHr || '';
      if(document.getElementById('pain-'+idx+'-leads')) document.getElementById('pain-'+idx+'-leads').value = p.leads || '';
      if(document.getElementById('pain-'+idx+'-ticket')) document.getElementById('pain-'+idx+'-ticket').value = p.ticket || '';
      if(document.getElementById('pain-'+idx+'-errors')) document.getElementById('pain-'+idx+'-errors').value = p.errors || '';
      if(document.getElementById('pain-'+idx+'-tool')) document.getElementById('pain-'+idx+'-tool').value = p.tool || '';
      
      if(document.getElementById('prio-'+idx+'-crit')) document.getElementById('prio-'+idx+'-crit').value = p.crit || '';
      if(document.getElementById('prio-'+idx+'-speed')) document.getElementById('prio-'+idx+'-speed').value = p.speed || '';
      if(document.getElementById('prio-'+idx+'-hours')) document.getElementById('prio-'+idx+'-hours').value = p.prioHours || '';
      if(document.getElementById('prio-'+idx+'-errors')) document.getElementById('prio-'+idx+'-errors').value = p.prioErrors || '';
    }
  }

  if(dc.sprintChoice) {
    const radio = document.querySelector(`input[name="selected-sprint-process"][value="${dc.sprintChoice}"]`);
    if(radio) radio.checked = true;
  }

  if(dc.roi) {
    if(document.getElementById('roi-leads-rec')) document.getElementById('roi-leads-rec').value = dc.roi.leadsRec || '';
    if(document.getElementById('roi-margin-net')) document.getElementById('roi-margin-net').value = dc.roi.marginNet || '';
    if(document.getElementById('roi-risk-evited')) document.getElementById('roi-risk-evited').value = dc.roi.riskEvited || '';
    if(document.getElementById('roi-sprint-fee')) document.getElementById('roi-sprint-fee').value = dc.roi.sprintFee || '';
  }

  setTimeout(triggerRecalcs, 100);
}

// Keep the rest of the functions (fetchDiagnosticsList, resetForm, saveCurrentDiagnostic)
// For brevity and to ensure we don't break the database calls, let's inject the database calls below
function fetchDiagnosticsList() {
  fetch('/api/diagnosticos')
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById('diagnostics-list-container');
      if(!container) return;
      if (data.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Sin registros</h3><p>No hay diagnósticos guardados aún.</p></div>';
        return;
      }
      container.innerHTML = '';
      data.forEach(d => {
        const item = document.createElement('div');
        item.className = 'diag-item';
        item.innerHTML = `
          <div>
            <strong>${d.empresa}</strong>
            <span class="sub" style="display:block;">${d.giro} | ${d.fecha}</span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="loadDiagnostic(${d.id})">Cargar</button>
        `;
        container.appendChild(item);
      });
    })
    .catch(console.error);
}

function loadDiagnostic(id) {
  fetch('/api/diagnosticos/'+id)
    .then(r => r.json())
    .then(data => {
      resetFormToNew();
      populateFormFromData(data);
      showStep(1);
    })
    .catch(console.error);
}

function saveCurrentDiagnostic() {
  const payload = collectFormData();
  
  // Agregar métricas adicionales para el backend
  const confidenceScoreText = document.getElementById('confidence-score-badge')?.textContent || '';
  const confidenceScoreMatch = confidenceScoreText.match(/\\d+/);
  payload.score_confianza = confidenceScoreMatch ? parseFloat(confidenceScoreMatch[0]) : 0;
  
  const tcoTotalText = document.getElementById('res-roi-tco-total')?.textContent || '0';
  payload.tco_total = parseFloat(tcoTotalText.replace(/[^0-9.-]+/g,"")) || 0;
  
  const roiAnualText = document.getElementById('res-roi-sales-extra')?.textContent || '0';
  payload.roi_anual = parseFloat(roiAnualText.replace(/[^0-9.-]+/g,"")) || 0;

  const endpoint = currentDiagId ? `/api/diagnosticos/${currentDiagId}` : '/api/diagnosticos';
  const method = currentDiagId ? 'PUT' : 'POST';

  fetch(endpoint, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    alert('✅ Diagnóstico guardado exitosamente.');
    currentDiagId = data.id;
    if(document.getElementById('shareable-client-url')) {
      document.getElementById('shareable-client-url').value = window.location.origin + '/dashboard/' + data.id;
    }
  })
  .catch(err => {
    console.error(err);
    alert('Error al guardar el diagnóstico');
  });
}

function resetFormToNew() {
  currentDiagId = null;
  document.querySelectorAll('input').forEach(i => {
    if (i.type === 'checkbox' || i.type === 'radio') i.checked = false;
    else i.value = '';
  });
  setDefaultDates();
  showStep(1);
}

function copyClientURL() {
  const el = document.getElementById('shareable-client-url');
  if(!el || !el.value) return;
  el.select();
  document.execCommand('copy');
  alert('Link copiado al portapapeles');
}

function triggerNativePrint() {
  window.print();
}

function saveAndGoToDashboard() {
  saveCurrentDiagnostic();
  showStep(3); // Now we just have 3 steps
}

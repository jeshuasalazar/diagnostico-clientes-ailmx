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
  document.getElementById('f-fecha').value = today;
}

// Navegar entre secciones del formulario
function showStep(stepNum) {
  // Ocultar todos los panes
  document.querySelectorAll('.step-pane').forEach(pane => pane.style.display = 'none');
  
  // Quitar clase activa de la navegación
  document.querySelectorAll('.nav-menu .nav-item').forEach(item => item.classList.remove('active'));
  
  // Mostrar pane y activar item de nav
  const activePane = document.getElementById(`pane-step-${stepNum}`);
  if (activePane) activePane.style.display = 'block';
  
  const activeNavItem = document.getElementById(`nav-step-${stepNum}`);
  if (activeNavItem) activeNavItem.classList.add('active');

  // Ajustar títulos e interfaces según el paso
  const titles = [
    { title: "Historial de Diagnósticos", sub: "Auditorías Operativas de Inteligencia Artificial" },
    { title: "01. Datos del Negocio", sub: "Llenado Pre-fill — Datos Generales del Cliente" },
    { title: "02. Cuellos de Botella", sub: "Dolores Clave de la Vertical de Servicios Profesionales" },
    { title: "03. Cuantificación del Dolor ($MXN)", sub: "Convertir dolores operativos en pérdidas anuales de dinero" },
    { title: "04. Matriz de Priorización", sub: "Weighted Scoring Model para elegir el proyecto de entrada" },
    { title: "05. Simulación Financiera (ROI)", sub: "Cálculo del caso de negocio con Productividad Fantasma" },
    { title: "06. Diseño de la Oferta", sub: "Estructura comercial, stack técnico del agente y próximos pasos" },
    { title: "07. Dashboard de Diagnóstico", sub: "Resumen y Proyecciones Financieras" }
  ];

  if (titles[stepNum]) {
    document.getElementById('workspace-title').textContent = titles[stepNum].title;
    document.getElementById('workspace-subtitle').textContent = titles[stepNum].sub;
  }

  // Mostrar el botón de Guardar si no estamos en inicio
  document.getElementById('btn-save-diagnostico').style.display = stepNum > 0 ? 'inline-flex' : 'none';

  // Si entramos al paso 7 (Dashboard), forzar recálculo
  if (stepNum === 7) {
    triggerRecalcs();
  }
}

// Cambiar la vertical seleccionada
function handleGiroChange(giro) {
  const notSelectedPane = document.getElementById('vertical-not-selected-message');
  const activePane = document.getElementById('vertical-active-pane');
  
  if (!giro) {
    notSelectedPane.style.display = 'block';
    activePane.style.display = 'none';
    return;
  }

  notSelectedPane.style.display = 'none';
  activePane.style.display = 'flex';
  
  const data = VERTICALS_DB[giro];
  document.getElementById('active-vertical-label').textContent = data.label;
  
  // Cargar Dolores checklist
  const container = document.getElementById('bottlenecks-checkboxes-container');
  container.innerHTML = '';
  
  data.bottlenecks.forEach((b, idx) => {
    const item = document.createElement('div');
    item.className = 'bottleneck-item';
    item.innerHTML = `
      <input type="checkbox" id="bot-${idx}" class="bottleneck-check" value="${b}" onchange="handleBottleneckCheckChange(this)">
      <div class="bottleneck-content">
        <span class="bottleneck-text">${b}</span>
      </div>
    `;
    container.appendChild(item);
  });

  // Cargar Caso, métricas y sustitución
  document.getElementById('ref-case-text').textContent = data.refCase;
  document.getElementById('ref-metric-text').textContent = data.metric;
  document.getElementById('ref-replace-text').textContent = data.replace;

  // Llenar campos custom por defecto (se pueden editar)
  document.getElementById('cust-ref-case').value = data.refCase;
  document.getElementById('cust-metric').value = data.metric;
  document.getElementById('cust-replace').value = data.replace;
}

// Al seleccionar bottlenecks, actualizar los inputs de la Sección 3
function handleBottleneckCheckChange() {
  const checked = Array.from(document.querySelectorAll('.bottleneck-check:checked')).map(c => c.value);
  
  // Actualizar los inputs de nombres de procesos en la Sección 3 por defecto
  if (checked[0]) {
    document.getElementById('pain-1-name').value = checked[0];
  }
  if (checked[1]) {
    document.getElementById('pain-2-name').value = checked[1];
  }
  
  syncPrintData();
}

// Inicializar el Gráfico Radar de Prioridades
function initPriorityChart() {
  const ctx = document.getElementById('priority-radar-chart');
  if (!ctx) return;

  priorityChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'Criticalidad del Dolor (35%)',
        'Velocidad de MVP (25%)',
        'Horas-Hombre Liberadas (20%)',
        'Mitigación de Errores (20%)'
      ],
      datasets: [
        {
          label: 'Proceso #1',
          data: [8, 7, 9, 5],
          backgroundColor: 'rgba(73, 121, 236, 0.2)',
          borderColor: 'rgba(73, 121, 236, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(73, 121, 236, 1)'
        },
        {
          label: 'Proceso #2',
          data: [6, 9, 5, 8],
          backgroundColor: 'rgba(255, 107, 71, 0.2)',
          borderColor: 'rgba(255, 107, 71, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 107, 71, 1)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: true },
          suggestedMin: 0,
          suggestedMax: 10
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

// Disparar los cálculos matemáticos en caliente y actualizar gráficos
function triggerRecalcs() {
  if (typeof aiFormulas === 'undefined') return;

  // 1. Obtener valores de Dolores (Sección 3)
  const pain1Inputs = {
    horasSemana: document.getElementById('pain-1-hours').value,
    personas: document.getElementById('pain-1-persons').value,
    costoHora: document.getElementById('pain-1-cost-hr').value,
    leadsPerdidosMes: document.getElementById('pain-1-leads').value,
    ticketPromedio: document.getElementById('pain-1-ticket').value,
    erroresMes: document.getElementById('pain-1-errors').value,
    costoSolucionActualMes: document.getElementById('pain-1-tool').value
  };

  const pain2Inputs = {
    horasSemana: document.getElementById('pain-2-hours').value,
    personas: document.getElementById('pain-2-persons').value,
    costoHora: document.getElementById('pain-2-cost-hr').value,
    leadsPerdidosMes: document.getElementById('pain-2-leads').value,
    ticketPromedio: document.getElementById('pain-2-ticket').value,
    erroresMes: document.getElementById('pain-2-errors').value,
    costoSolucionActualMes: document.getElementById('pain-2-tool').value
  };

  const p1Res = aiFormulas.calcularCostoDolor(pain1Inputs);
  const p2Res = aiFormulas.calcularCostoDolor(pain2Inputs);

  // Actualizar Badges
  document.getElementById('pain-1-annual-badge').textContent = `$${p1Res.total.toLocaleString()} MXN / año`;
  document.getElementById('pain-2-annual-badge').textContent = `$${p2Res.total.toLocaleString()} MXN / año`;

  // 2. Obtener valores de Priorización (Sección 4)
  const prio1Inputs = {
    criticalidad: document.getElementById('prio-1-crit').value,
    velocidadMVP: document.getElementById('prio-1-speed').value,
    liberacionHoras: document.getElementById('prio-1-hours').value,
    mitigacionErrores: document.getElementById('prio-1-errors').value
  };

  const prio2Inputs = {
    criticalidad: document.getElementById('prio-2-crit').value,
    velocidadMVP: document.getElementById('prio-2-speed').value,
    liberacionHoras: document.getElementById('prio-2-hours').value,
    mitigacionErrores: document.getElementById('prio-2-errors').value
  };

  const score1 = aiFormulas.calcularPriorizacion(prio1Inputs);
  const score2 = aiFormulas.calcularPriorizacion(prio2Inputs);

  document.getElementById('prio-1-total-score').textContent = `${score1.toFixed(2)} / 10`;
  document.getElementById('prio-2-total-score').textContent = `${score2.toFixed(2)} / 10`;

  // Actualizar etiquetas en la selección de radio
  const p1Name = document.getElementById('pain-1-name').value || "Proceso #1";
  const p2Name = document.getElementById('pain-2-name').value || "Proceso #2";
  document.getElementById('lbl-radio-proc1').textContent = `${p1Name} (${score1.toFixed(2)} / 10)`;
  document.getElementById('lbl-radio-proc2').textContent = `${p2Name} (${score2.toFixed(2)} / 10)`;

  // Actualizar Gráfico Radar
  if (priorityChart) {
    priorityChart.data.datasets[0].label = p1Name;
    priorityChart.data.datasets[0].data = [
      parseFloat(prio1Inputs.criticalidad) || 0,
      parseFloat(prio1Inputs.velocidadMVP) || 0,
      parseFloat(prio1Inputs.liberacionHoras) || 0,
      parseFloat(prio1Inputs.mitigacionErrores) || 0
    ];

    priorityChart.data.datasets[1].label = p2Name;
    priorityChart.data.datasets[1].data = [
      parseFloat(prio2Inputs.criticalidad) || 0,
      parseFloat(prio2Inputs.velocidadMVP) || 0,
      parseFloat(prio2Inputs.liberacionHoras) || 0,
      parseFloat(prio2Inputs.mitigacionErrores) || 0
    ];
    priorityChart.update();
  }

  // 3. Obtener Proceso de Sprint Seleccionado para ROI
  const sprintProcChoice = document.querySelector('input[name="selected-sprint-process"]:checked').value;
  const activePainRes = sprintProcChoice === "1" ? p1Res : p2Res;
  const activePainInputs = sprintProcChoice === "1" ? pain1Inputs : pain2Inputs;
  const activePrioScore = sprintProcChoice === "1" ? score1 : score2;
  const activeName = sprintProcChoice === "1" ? p1Name : p2Name;

  // Rellenar dinámicamente datos de ROI desde el proceso activo
  const hrsLiberadas = parseFloat(activePainInputs.horasSemana) * parseFloat(activePainInputs.personas) || 0;
  
  const roiInputs = {
    horasLiberadasSemana: hrsLiberadas,
    costoHora: activePainInputs.costoHora,
    leadsRecuperadosMes: document.getElementById('roi-leads-rec').value,
    ticketPromedio: document.getElementById('f-ticket').value || activePainInputs.ticketPromedio,
    margenNetoPercent: document.getElementById('roi-margin-net').value,
    costoRiesgoEvitadoAnual: document.getElementById('roi-risk-evited').value,
    sprintFee: document.getElementById('roi-sprint-fee').value
  };

  const roiRes = aiFormulas.calcularROI(roiInputs);

  // Actualizar resultados en Sección 5
  document.getElementById('res-roi-time-saved').textContent = `$${Math.round(roiRes.ahorroTiempo).toLocaleString()} MXN`;
  document.getElementById('res-roi-sales-extra').textContent = `$${Math.round(roiRes.ingresosExtra).toLocaleString()} MXN`;
  document.getElementById('res-roi-risk-avoided').textContent = `$${Math.round(roiRes.riesgoEvitado).toLocaleString()} MXN`;
  document.getElementById('res-roi-benefits-total').textContent = `$${Math.round(roiRes.totalBeneficios).toLocaleString()} MXN`;
  document.getElementById('res-roi-tco-total').textContent = `$${Math.round(roiRes.tcoTotal).toLocaleString()} MXN`;
  
  const roiValElement = document.getElementById('res-roi-percent-value');
  roiValElement.textContent = `${roiRes.roiPercent.toLocaleString()}%`;
  roiValElement.style.color = roiRes.roiPercent >= 100 ? 'var(--sage)' : 'var(--brand-deep)';
  
  document.getElementById('res-roi-payback-value').textContent = `${roiRes.paybackMonths} meses`;

  // 4. Actualizar Sección 7 (Dashboard)
  document.getElementById('dash-pain-total').textContent = `$${Math.round(activePainRes.total).toLocaleString()} MXN`;
  document.getElementById('dash-benefits-total').textContent = `$${Math.round(roiRes.totalBeneficios).toLocaleString()} MXN`;
  
  const dashRoiVal = document.getElementById('dash-roi-percent');
  dashRoiVal.textContent = `${roiRes.roiPercent.toLocaleString()}%`;
  dashRoiVal.style.color = roiRes.roiPercent >= 100 ? 'var(--sage)' : 'var(--brand-deep)';
  
  document.getElementById('dash-payback-months').textContent = `${roiRes.paybackMonths} meses`;
  
  document.getElementById('dash-pricing-sprint').textContent = `$${parseFloat(roiInputs.sprintFee).toLocaleString()} MXN`;
  
  // Actualizar métricas del dashboard
  document.getElementById('dash-metric-name').textContent = document.getElementById('off-metric-name').value;
  document.getElementById('dash-metric-base').textContent = document.getElementById('off-metric-base').value;
  document.getElementById('dash-metric-goal').textContent = document.getElementById('off-metric-goal').value;

  // Sincronizar todos los datos al layout imprimible
  syncPrintData(p1Res, p2Res, score1, score2, roiRes, activeName);
}

// Sincronizar los valores editables al layout para impresión
function syncPrintData(p1Res = null, p2Res = null, score1 = 0, score2 = 0, roiRes = null, activeName = "") {
  document.getElementById('p-meta-empresa').textContent = document.getElementById('f-empresa').value || "Empresa";
  document.getElementById('p-meta-giro').textContent = document.getElementById('f-giro').value || "Vertical";
  document.getElementById('p-meta-consultor').textContent = document.getElementById('f-consultor').value || "aiLearning";
  
  // Fecha legible
  const fVal = document.getElementById('f-fecha').value;
  document.getElementById('p-meta-folio').textContent = fVal ? `AG-${fVal.replace(/-/g, '')}` : 'AG-2026';

  // Datos Comerciales
  const contacto = document.getElementById('f-contacto').value || "Contacto";
  const cargo = document.getElementById('f-cargo').value || "Cargo";
  document.getElementById('p-dat-contacto').textContent = `${contacto} (${cargo})`;
  
  const ciudad = document.getElementById('f-ciudad').value || "Ciudad";
  const operando = document.getElementById('f-operando').value || "0";
  document.getElementById('p-dat-ciudad').textContent = `${ciudad} — ${operando} años operando`;

  const totalEmp = document.getElementById('f-empleados-total').value || "0";
  const adminEmp = document.getElementById('f-empleados-admin').value || "0";
  document.getElementById('p-dat-empleados').textContent = `${totalEmp} Empleados totales (${adminEmp} en Admin/Op)`;

  const ticket = parseFloat(document.getElementById('f-ticket').value) || 0;
  const transaccs = parseFloat(document.getElementById('f-transacciones').value) || 0;
  document.getElementById('p-dat-metrics').textContent = `Ticket: $${ticket.toLocaleString()} MXN | Transacciones: ${transaccs}/mes`;

  document.getElementById('p-dat-crm').textContent = document.getElementById('f-crm').value || "No tiene";
  document.getElementById('p-dat-erp').textContent = document.getElementById('f-erp').value || "No tiene";
  
  // Canales checked
  const channels = [];
  if (document.getElementById('chan-wa').checked) channels.push("WhatsApp");
  if (document.getElementById('chan-ig').checked) channels.push("Inst/FB");
  if (document.getElementById('chan-tel').checked) channels.push("Llamadas");
  if (document.getElementById('chan-web').checked) channels.push("Web");
  document.getElementById('p-dat-canales').textContent = channels.join(', ') || "Ninguno";

  const factVal = parseFloat(document.getElementById('f-facturacion').value) || 0;
  const metaVal = parseFloat(document.getElementById('f-meta-facturacion').value) || 0;
  document.getElementById('p-dat-facturacion').textContent = `Facturación: $${factVal.toLocaleString()} ➔ Meta: $${metaVal.toLocaleString()} MXN/mes`;

  // Cuellos de botella print view list
  const pChecklist = document.getElementById('print-bottlenecks-list-container');
  pChecklist.innerHTML = '';
  const checkedBots = Array.from(document.querySelectorAll('.bottleneck-check:checked')).map(c => c.value);
  if (checkedBots.length === 0) {
    pChecklist.innerHTML = '<div style="color:var(--mute);">Ningún cuello de botella marcado hoy.</div>';
  } else {
    checkedBots.forEach(b => {
      const row = document.createElement('div');
      row.style.borderBottom = '1px dashed #d8d4cb';
      row.style.padding = '3px 0';
      row.innerHTML = `✓ ${b}`;
      pChecklist.appendChild(row);
    });
  }

  // Costo del dolor (Sección 3)
  const p1Name = document.getElementById('pain-1-name').value || "Proceso #1";
  const p2Name = document.getElementById('pain-2-name').value || "Proceso #2";
  document.getElementById('p-pain1-name').textContent = p1Name;
  document.getElementById('p-pain2-name').textContent = p2Name;

  if (p1Res && p2Res) {
    document.getElementById('p-pain1-personal').textContent = `$${Math.round(p1Res.personal).toLocaleString()}`;
    document.getElementById('p-pain1-sales').textContent = `$${Math.round(p1Res.oportunidades).toLocaleString()}`;
    document.getElementById('p-pain1-errors').textContent = `$${Math.round(p1Res.errores).toLocaleString()}`;
    document.getElementById('p-pain1-tool').textContent = `$${Math.round(p1Res.solucion).toLocaleString()}`;
    document.getElementById('p-pain1-total').textContent = `$${Math.round(p1Res.total).toLocaleString()}`;

    document.getElementById('p-pain2-personal').textContent = `$${Math.round(p2Res.personal).toLocaleString()}`;
    document.getElementById('p-pain2-sales').textContent = `$${Math.round(p2Res.oportunidades).toLocaleString()}`;
    document.getElementById('p-pain2-errors').textContent = `$${Math.round(p2Res.errores).toLocaleString()}`;
    document.getElementById('p-pain2-tool').textContent = `$${Math.round(p2Res.solucion).toLocaleString()}`;
    document.getElementById('p-pain2-total').textContent = `$${Math.round(p2Res.total).toLocaleString()}`;
  }

  // Priorización (Sección 4)
  document.getElementById('p-lbl-prio-proc1').textContent = p1Name;
  document.getElementById('p-lbl-prio-proc2').textContent = p2Name;
  
  document.getElementById('p-prio1-crit').textContent = document.getElementById('prio-1-crit').value;
  document.getElementById('p-prio2-crit').textContent = document.getElementById('prio-2-crit').value;
  document.getElementById('p-prio1-speed').textContent = document.getElementById('prio-1-speed').value;
  document.getElementById('p-prio2-speed').textContent = document.getElementById('prio-2-speed').value;
  document.getElementById('p-prio1-hours').textContent = document.getElementById('prio-1-hours').value;
  document.getElementById('p-prio2-speed2').textContent = document.getElementById('prio-2-hours').value;
  document.getElementById('p-prio1-errors').textContent = document.getElementById('prio-1-errors').value;
  document.getElementById('p-prio2-errors').textContent = document.getElementById('prio-2-errors').value;
  
  document.getElementById('p-prio1-total').textContent = `${score1.toFixed(2)} / 10`;
  document.getElementById('p-prio2-total').textContent = `${score2.toFixed(2)} / 10`;

  document.getElementById('p-sprint-selected-process').textContent = activeName || "Proceso de Sprint";

  // ROI & TCO (Sección 5)
  if (roiRes) {
    document.getElementById('p-roi-time-saved').textContent = `$${Math.round(roiRes.ahorroTiempo).toLocaleString()} MXN`;
    document.getElementById('p-roi-sales-extra').textContent = `$${Math.round(roiRes.ingresosExtra).toLocaleString()} MXN`;
    document.getElementById('p-roi-risk-avoided').textContent = `$${Math.round(roiRes.riesgoEvitado).toLocaleString()} MXN`;
    
    const pRoiVal = document.getElementById('p-roi-percent-value');
    pRoiVal.textContent = `${roiRes.roiPercent.toLocaleString()}%`;
    pRoiVal.style.color = roiRes.roiPercent >= 100 ? '#6B9080' : '#4979EC';
    
    document.getElementById('p-roi-payback-value').textContent = `${roiRes.paybackMonths} meses`;
    
    document.getElementById('p-pricing-sprint').textContent = `$${Math.round(roiRes.tcoSprint).toLocaleString()} MXN`;
  }

  // Oferta (Sección 6)
  const stack = [];
  if (document.getElementById('tool-make').checked) stack.push("Make");
  if (document.getElementById('tool-n8n').checked) stack.push("n8n");
  if (document.getElementById('tool-claude').checked) stack.push("Claude API");
  if (document.getElementById('tool-gpt').checked) stack.push("GPT-4o");
  if (document.getElementById('tool-wa').checked) stack.push("WhatsApp Business API");
  if (document.getElementById('tool-notion').checked) stack.push("Notion/Airtable");
  if (document.getElementById('tool-vapi').checked) stack.push("Vapi/Retell");
  if (document.getElementById('tool-hubspot').checked) stack.push("HubSpot");
  document.getElementById('p-off-stack').textContent = stack.join(', ') || "No-code Stack";

  const mName = document.getElementById('off-metric-name').value || "Ciclo";
  const mBase = document.getElementById('off-metric-base').value || "Base";
  const mGoal = document.getElementById('off-metric-goal').value || "Meta";
  document.getElementById('p-off-metric').textContent = `${mName}: ${mBase} ➔ ${mGoal}`;

  // Firmas
  document.getElementById('p-sig-consultor').textContent = document.getElementById('off-sig-consultor').value || "aiLearning";
  document.getElementById('p-sig-cliente').textContent = document.getElementById('off-sig-cliente').value || "Representante de la PyME";
}

// Obtener datos del formulario y convertirlos en un objeto estructurado
function collectFormData() {
  const checkedBots = Array.from(document.querySelectorAll('.bottleneck-check:checked')).map(c => c.value);
  const channels = {
    wa: document.getElementById('chan-wa').checked,
    ig: document.getElementById('chan-ig').checked,
    tel: document.getElementById('chan-tel').checked,
    web: document.getElementById('chan-web').checked
  };

  const tools = {
    make: document.getElementById('tool-make').checked,
    n8n: document.getElementById('tool-n8n').checked,
    claude: document.getElementById('tool-claude').checked,
    gpt: document.getElementById('tool-gpt').checked,
    wa: document.getElementById('tool-wa').checked,
    notion: document.getElementById('tool-notion').checked,
    vapi: document.getElementById('tool-vapi').checked,
    hubspot: document.getElementById('tool-hubspot').checked
  };

  const agentStack = {
    conversational: document.getElementById('stack-conv').checked,
    documental: document.getElementById('stack-doc').checked,
    multiAgent: document.getElementById('stack-orchestr').checked,
    backendProcess: document.getElementById('stack-backend').checked
  };

  return {
    empresa: document.getElementById('f-empresa').value,
    giro: document.getElementById('f-giro').value,
    nombre_contacto: document.getElementById('f-contacto').value,
    cargo: document.getElementById('f-cargo').value,
    consultor: document.getElementById('f-consultor').value,
    fecha: document.getElementById('f-fecha').value,
    datos_completos: {
      ciudad: document.getElementById('f-ciudad').value,
      operando: document.getElementById('f-operando').value,
      empleadosTotal: document.getElementById('f-empleados-total').value,
      empleadosAdmin: document.getElementById('f-empleados-admin').value,
      ticket: document.getElementById('f-ticket').value,
      transacciones: document.getElementById('f-transacciones').value,
      facturacion: document.getElementById('f-facturacion').value,
      metaFacturacion: document.getElementById('f-meta-facturacion').value,
      channels,
      crm: document.getElementById('f-crm').value,
      erp: document.getElementById('f-erp').value,
      checkedBots,
      custRefCase: document.getElementById('cust-ref-case').value,
      custMetric: document.getElementById('cust-metric').value,
      custReplace: document.getElementById('cust-replace').value,
      pain1: {
        name: document.getElementById('pain-1-name').value,
        hours: document.getElementById('pain-1-hours').value,
        persons: document.getElementById('pain-1-persons').value,
        costHr: document.getElementById('pain-1-cost-hr').value,
        leads: document.getElementById('pain-1-leads').value,
        ticket: document.getElementById('pain-1-ticket').value,
        errors: document.getElementById('pain-1-errors').value,
        tool: document.getElementById('pain-1-tool').value
      },
      pain2: {
        name: document.getElementById('pain-2-name').value,
        hours: document.getElementById('pain-2-hours').value,
        persons: document.getElementById('pain-2-persons').value,
        costHr: document.getElementById('pain-2-cost-hr').value,
        leads: document.getElementById('pain-2-leads').value,
        ticket: document.getElementById('pain-2-ticket').value,
        errors: document.getElementById('pain-2-errors').value,
        tool: document.getElementById('pain-2-tool').value
      },
      prio1: {
        crit: document.getElementById('prio-1-crit').value,
        speed: document.getElementById('prio-1-speed').value,
        hours: document.getElementById('prio-1-hours').value,
        errors: document.getElementById('prio-1-errors').value
      },
      prio2: {
        crit: document.getElementById('prio-2-crit').value,
        speed: document.getElementById('prio-2-speed').value,
        hours: document.getElementById('prio-2-hours').value,
        errors: document.getElementById('prio-2-errors').value
      },
      sprintChoice: document.querySelector('input[name="selected-sprint-process"]:checked').value,
      roi: {
        leadsRec: document.getElementById('roi-leads-rec').value,
        marginNet: document.getElementById('roi-margin-net').value,
        riskEvited: document.getElementById('roi-risk-evited').value,
        sprintFee: document.getElementById('roi-sprint-fee').value
      },
      offer: {
        solutionName: document.getElementById('off-solution-name').value,
        tools,
        agentStack,
        metricName: document.getElementById('off-metric-name').value,
        metricBase: document.getElementById('off-metric-base').value,
        metricGoal: document.getElementById('off-metric-goal').value,
        sigConsultor: document.getElementById('off-sig-consultor').value,
        sigCliente: document.getElementById('off-sig-cliente').value
      }
    }
  };
}

// Colocar los valores cargados de la base de datos al formulario en pantalla
function populateFormFromData(diag) {
  currentDiagId = diag.id;
  
  document.getElementById('f-empresa').value = diag.empresa || '';
  document.getElementById('f-giro').value = diag.giro || '';
  handleGiroChange(diag.giro); // Cargar dolores de la vertical

  document.getElementById('f-contacto').value = diag.nombre_contacto || '';
  document.getElementById('f-cargo').value = diag.cargo || '';
  document.getElementById('f-consultor').value = diag.consultor || '';
  document.getElementById('f-fecha').value = diag.fecha ? diag.fecha.split('T')[0] : '';

  const dc = diag.datos_completos || {};
  
  document.getElementById('f-ciudad').value = dc.ciudad || '';
  document.getElementById('f-operando').value = dc.operando || '';
  document.getElementById('f-empleados-total').value = dc.empleadosTotal || '';
  document.getElementById('f-empleados-admin').value = dc.empleadosAdmin || '';
  document.getElementById('f-ticket').value = dc.ticket || '';
  document.getElementById('f-transacciones').value = dc.transacciones || '';
  document.getElementById('f-facturacion').value = dc.facturacion || '';
  document.getElementById('f-meta-facturacion').value = dc.metaFacturacion || '';

  // Canales
  if (dc.channels) {
    document.getElementById('chan-wa').checked = !!dc.channels.wa;
    document.getElementById('chan-ig').checked = !!dc.channels.ig;
    document.getElementById('chan-tel').checked = !!dc.channels.tel;
    document.getElementById('chan-web').checked = !!dc.channels.web;
  }

  document.getElementById('f-crm').value = dc.crm || '';
  document.getElementById('f-erp').value = dc.erp || '';

  // Dolores marcados
  setTimeout(() => {
    if (dc.checkedBots && Array.isArray(dc.checkedBots)) {
      document.querySelectorAll('.bottleneck-check').forEach(checkbox => {
        checkbox.checked = dc.checkedBots.includes(checkbox.value);
      });
    }
  }, 100);

  document.getElementById('cust-ref-case').value = dc.custRefCase || '';
  document.getElementById('cust-metric').value = dc.custMetric || '';
  document.getElementById('cust-replace').value = dc.custReplace || '';

  // Pain 1
  if (dc.pain1) {
    document.getElementById('pain-1-name').value = dc.pain1.name || '';
    document.getElementById('pain-1-hours').value = dc.pain1.hours || '';
    document.getElementById('pain-1-persons').value = dc.pain1.persons || '';
    document.getElementById('pain-1-cost-hr').value = dc.pain1.costHr || '';
    document.getElementById('pain-1-leads').value = dc.pain1.leads || '';
    document.getElementById('pain-1-ticket').value = dc.pain1.ticket || '';
    document.getElementById('pain-1-errors').value = dc.pain1.errors || '';
    document.getElementById('pain-1-tool').value = dc.pain1.tool || '';
  }

  // Pain 2
  if (dc.pain2) {
    document.getElementById('pain-2-name').value = dc.pain2.name || '';
    document.getElementById('pain-2-hours').value = dc.pain2.hours || '';
    document.getElementById('pain-2-persons').value = dc.pain2.persons || '';
    document.getElementById('pain-2-cost-hr').value = dc.pain2.costHr || '';
    document.getElementById('pain-2-leads').value = dc.pain2.leads || '';
    document.getElementById('pain-2-ticket').value = dc.pain2.ticket || '';
    document.getElementById('pain-2-errors').value = dc.pain2.errors || '';
    document.getElementById('pain-2-tool').value = dc.pain2.tool || '';
  }

  // Priorizaciones
  if (dc.prio1) {
    document.getElementById('prio-1-crit').value = dc.prio1.crit || '';
    document.getElementById('prio-1-speed').value = dc.prio1.speed || '';
    document.getElementById('prio-1-hours').value = dc.prio1.hours || '';
    document.getElementById('prio-1-errors').value = dc.prio1.errors || '';
  }
  if (dc.prio2) {
    document.getElementById('prio-2-crit').value = dc.prio2.crit || '';
    document.getElementById('prio-2-speed').value = dc.prio2.speed || '';
    document.getElementById('prio-2-hours').value = dc.prio2.hours || '';
    document.getElementById('prio-2-errors').value = dc.prio2.errors || '';
  }

  // Sprint Choice Radio
  if (dc.sprintChoice) {
    const radio = document.querySelector(`input[name="selected-sprint-process"][value="${dc.sprintChoice}"]`);
    if (radio) radio.checked = true;
  }

  // ROI
  if (dc.roi) {
    document.getElementById('roi-leads-rec').value = dc.roi.leadsRec || '';
    document.getElementById('roi-margin-net').value = dc.roi.marginNet || '';
    document.getElementById('roi-risk-evited').value = dc.roi.riskEvited || '';
    document.getElementById('roi-sprint-fee').value = dc.roi.sprintFee || '';
  }

  // Oferta
  if (dc.offer) {
    document.getElementById('off-solution-name').value = dc.offer.solutionName || '';
    
    // Tools
    if (dc.offer.tools) {
      document.getElementById('tool-make').checked = !!dc.offer.tools.make;
      document.getElementById('tool-n8n').checked = !!dc.offer.tools.n8n;
      document.getElementById('tool-claude').checked = !!dc.offer.tools.claude;
      document.getElementById('tool-gpt').checked = !!dc.offer.tools.gpt;
      document.getElementById('tool-wa').checked = !!dc.offer.tools.wa;
      document.getElementById('tool-notion').checked = !!dc.offer.tools.notion;
      document.getElementById('tool-vapi').checked = !!dc.offer.tools.vapi;
      document.getElementById('tool-hubspot').checked = !!dc.offer.tools.hubspot;
    }

    // Stack
    if (dc.offer.agentStack) {
      document.getElementById('stack-conv').checked = !!dc.offer.agentStack.conversational;
      document.getElementById('stack-doc').checked = !!dc.offer.agentStack.documental;
      document.getElementById('stack-orchestr').checked = !!dc.offer.agentStack.multiAgent;
      document.getElementById('stack-backend').checked = !!dc.offer.agentStack.backendProcess;
    }

    document.getElementById('off-metric-name').value = dc.offer.metricName || '';
    document.getElementById('off-metric-base').value = dc.offer.metricBase || '';
    document.getElementById('off-metric-goal').value = dc.offer.metricGoal || '';
    document.getElementById('off-sig-consultor').value = dc.offer.sigConsultor || '';
    document.getElementById('off-sig-cliente').value = dc.offer.sigCliente || '';
  }

  // Cargar link único de cliente en la pantalla
  const clientURL = `${window.location.origin}/cliente/${diag.id}`;
  document.getElementById('shareable-client-url').value = clientURL;

  // Actualizar cálculos
  setTimeout(() => {
    triggerRecalcs();
  }, 200);
}

// Limpiar el formulario e iniciar un diagnóstico en blanco
function resetFormToNew() {
  currentDiagId = null;
  document.getElementById('f-empresa').value = '';
  document.getElementById('f-giro').value = '';
  document.getElementById('f-contacto').value = '';
  document.getElementById('f-cargo').value = '';
  document.getElementById('f-ciudad').value = '';
  document.getElementById('f-operando').value = '';
  document.getElementById('f-empleados-total').value = '';
  document.getElementById('f-empleados-admin').value = '';
  document.getElementById('f-ticket').value = '';
  document.getElementById('f-transacciones').value = '';
  document.getElementById('f-facturacion').value = '';
  document.getElementById('f-meta-facturacion').value = '';
  
  document.getElementById('chan-wa').checked = false;
  document.getElementById('chan-ig').checked = false;
  document.getElementById('chan-tel').checked = false;
  document.getElementById('chan-web').checked = false;
  
  document.getElementById('f-crm').value = '';
  document.getElementById('f-erp').value = '';
  
  const notSelectedPane = document.getElementById('vertical-not-selected-message');
  const activePane = document.getElementById('vertical-active-pane');
  notSelectedPane.style.display = 'block';
  activePane.style.display = 'none';

  // Limpiar Sección 3
  document.getElementById('pain-1-name').value = '';
  document.getElementById('pain-1-hours').value = '';
  document.getElementById('pain-1-persons').value = '';
  document.getElementById('pain-1-cost-hr').value = '';
  document.getElementById('pain-1-leads').value = '';
  document.getElementById('pain-1-ticket').value = '';
  document.getElementById('pain-1-errors').value = '';
  document.getElementById('pain-1-tool').value = '';

  document.getElementById('pain-2-name').value = '';
  document.getElementById('pain-2-hours').value = '';
  document.getElementById('pain-2-persons').value = '';
  document.getElementById('pain-2-cost-hr').value = '';
  document.getElementById('pain-2-leads').value = '';
  document.getElementById('pain-2-ticket').value = '';
  document.getElementById('pain-2-errors').value = '';
  document.getElementById('pain-2-tool').value = '';

  // Limpiar Sección 5 y 6
  document.getElementById('roi-leads-rec').value = '2';
  document.getElementById('roi-margin-net').value = '25';
  document.getElementById('roi-risk-evited').value = '0';
  document.getElementById('roi-sprint-fee').value = '60000';

  document.getElementById('off-solution-name').value = 'Sistema de Fuerza Laboral IA';
  document.getElementById('off-metric-name').value = 'Tiempo de ciclo';
  document.getElementById('off-metric-base').value = 'Horas';
  document.getElementById('off-metric-goal').value = '< 30 min';
  document.getElementById('off-sig-cliente').value = '';

  setDefaultDates();
  showStep(1);
}

// =================================────────────────================
// CONEXIÓN CON LA API REST DEL BACKEND (SQLite)
// =================================────────────────================

// 1. Obtener la lista de todos los diagnósticos de Step 0
async function fetchDiagnosticsList() {
  const container = document.getElementById('diagnostics-list-container');
  try {
    const res = await fetch('/api/diagnosticos');
    if (!res.ok) throw new Error("Error fetching diagnostics");
    const list = await res.json();
    
    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No hay diagnósticos registrados aún</h3>
          <p>Haz clic en "Nuevo Diagnóstico" para iniciar la videollamada con un cliente.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    list.forEach(diag => {
      const item = document.createElement('div');
      item.className = 'diag-item';
      
      const dateStr = diag.fecha ? new Date(diag.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : 'N/A';

      item.innerHTML = `
        <div class="diag-info">
          <h4>${diag.empresa}</h4>
          <p>
            <span>${diag.giro}</span>
            <span>Contacto: ${diag.nombre_contacto || 'N/A'}</span>
            <span>Fecha: ${dateStr}</span>
          </p>
        </div>
        <div class="diag-actions">
          <button class="btn btn-secondary" onclick="loadDiagnosticToForm('${diag.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar</button>
          <a class="btn btn-primary" href="/cliente/${diag.id}" target="_blank"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Dashboard</a>
          <button class="btn btn-secondary" onclick="copyDiagnosticLink('${diag.id}')" style="background:#5c6bc0; color:white; border:none; display:inline-flex; align-items:center; gap:6px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar Enlace</button>
          <button class="btn btn-coral" onclick="deleteDiagnostic('${diag.id}', '${diag.empresa}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Borrar</button>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="empty-state" style="color:var(--coral);">
        <h3>Fallo en la comunicación con el servidor</h3>
        <p>No se pudo conectar a la base de datos local SQLite. Intenta recargar o verificar el servidor.</p>
      </div>
    `;
  }
}

// 2. Cargar un diagnóstico de la base de datos al formulario en pantalla
async function loadDiagnosticToForm(id) {
  try {
    const res = await fetch(`/api/diagnosticos/${id}`);
    if (!res.ok) throw new Error("Error loading diagnostic data");
    const diag = await res.json();
    populateFormFromData(diag);
    showStep(1); // Mover al primer paso del formulario
  } catch (err) {
    console.error(err);
    alert("Error al cargar la información del diagnóstico.");
  }
}

// 3. Guardar el progreso del diagnóstico actual (Insert o Update)
async function saveCurrentDiagnostic() {
  const payload = collectFormData();
  
  if (!payload.empresa || !payload.giro) {
    alert("Por favor, ingrese el nombre de la empresa y seleccione la vertical en la Sección 1.");
    showStep(1);
    return;
  }

  const url = currentDiagId ? `/api/diagnosticos/${currentDiagId}` : '/api/diagnosticos';
  const method = currentDiagId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error("Error saving diagnostic");
    const result = await res.json();

    if (result.id) {
      currentDiagId = result.id;
      // Actualizar link de cliente
      const clientURL = `${window.location.origin}/cliente/${result.id}`;
      document.getElementById('shareable-client-url').value = clientURL;
    }

    showToast("💾 ¡Progreso guardado con éxito en SQLite!");
    fetchDiagnosticsList(); // Recargar Step 0 en segundo plano
  } catch (err) {
    console.error(err);
    alert("Error al guardar la información en el servidor.");
  }
}

// 4. Guardar y brincar al Dashboard final (Paso 7)
async function saveAndGoToDashboard() {
  const payload = collectFormData();
  if (!payload.empresa || !payload.giro) {
    alert("Los campos Empresa y Giro de la Sección 1 son obligatorios.");
    showStep(1);
    return;
  }

  await saveCurrentDiagnostic();
  showStep(7);
}

// 5. Borrar un diagnóstico por ID
async function deleteDiagnostic(id, empresa) {
  if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el diagnóstico de "${empresa}"?`)) return;

  try {
    const res = await fetch(`/api/diagnosticos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Error deleting record");
    showToast("🗑️ Registro eliminado con éxito.");
    fetchDiagnosticsList();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar el registro.");
  }
}

// =================================────────────────================
// UTILIDADES & NOTIFICACIONES (TOAST)
// =================================────────────────================

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function copyClientURL() {
  const urlEl = document.getElementById('shareable-client-url');
  if (!urlEl || !urlEl.value) return;
  
  urlEl.select();
  document.execCommand('copy');
  showToast("📋 ¡Enlace copiado al portapapeles con éxito!");
}

function copyDiagnosticLink(id) {
  const clientUrl = window.location.origin + '/cliente/' + id;
  const tempInput = document.createElement('input');
  tempInput.value = clientUrl;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast("📋 ¡Enlace del cliente copiado al portapapeles con éxito!");
}

// Disparar la impresión nativa de Chrome/Safari (Usa CSS @media print)
function triggerNativePrint() {
  // Asegurarnos de que el print view esté sincronizado antes de imprimir
  triggerRecalcs();
  window.print();
}

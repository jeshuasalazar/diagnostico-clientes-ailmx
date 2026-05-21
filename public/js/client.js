/**
 * client.js
 * Lógica del Workspace del Cliente para la visualización del diagnóstico y descarga.
 */

let priorityChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initClientDashboard();
});

// Función principal de inicialización
async function initClientDashboard() {
  try {
    // 1. Extraer ID del diagnóstico desde el pathname (/cliente/:id)
    const path = window.location.pathname.replace(/\/$/, ""); // eliminar slash final
    const pathSegments = path.split('/');
    const diagId = pathSegments[pathSegments.length - 1];

    if (!diagId || diagId === "cliente") {
      showErrorState("Folio de diagnóstico no válido en la URL.");
      return;
    }

    // 2. Cargar datos del servidor
    const res = await fetch(`/api/diagnosticos/${diagId}`);
    if (!res.ok) {
      if (res.status === 404) {
        showErrorState("El diagnóstico solicitado no existe o fue eliminado.");
      } else {
        showErrorState("Error de servidor al cargar el diagnóstico.");
      }
      return;
    }

    const diag = await res.json();
    
    // 3. Renderizar y procesar los cálculos financieros en caliente
    renderClientWorkspace(diag);

  } catch (err) {
    console.error("Error initializing client workspace:", err);
    showErrorState("Fallo en la conexión de red con el servidor local.");
  }
}

// Mostrar estado de error en pantalla
function showErrorState(message) {
  const container = document.querySelector('.client-layout');
  if (container) {
    container.innerHTML = `
      <div class="card" style="border-color:var(--coral); text-align:center; padding:60px 40px; margin-top:40px;">
        <div style="font-size:48px; margin-bottom:16px;">⚠️</div>
        <h3 style="color:var(--coral); font-size:24px; font-family:'Space Grotesk',sans-serif; font-weight:700;">No se pudo cargar la información</h3>
        <p style="color:var(--mute); margin-top:8px; font-size:15px; max-width:500px; margin-left:auto; margin-right:auto;">${message}</p>
        <div style="margin-top:24px;">
          <a href="/" class="btn btn-secondary">Regresar al Panel Principal</a>
        </div>
      </div>
    `;
  }
  
  const clientComp = document.getElementById('client-company-name');
  if (clientComp) clientComp.textContent = "Error";
}

// Renderizar todos los widgets del cliente y ejecutar las fórmulas
function renderClientWorkspace(diag) {
  const dc = diag.datos_completos || {};

  // 1. Datos del Hero
  document.getElementById('client-company-name').textContent = diag.empresa;
  document.getElementById('client-vertical-label').textContent = diag.giro;
  
  const contactText = diag.nombre_contacto 
    ? `${diag.nombre_contacto} ${diag.cargo ? `(${diag.cargo})` : ''}` 
    : 'No especificado';
  document.getElementById('client-contact-name').textContent = contactText;
  
  const folioText = diag.fecha ? `AG-${diag.fecha.replace(/-/g, '')}` : 'AG-2026';
  document.getElementById('client-folio').textContent = folioText;
  
  const dateText = diag.fecha 
    ? new Date(diag.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }) 
    : 'N/A';
  document.getElementById('client-date').textContent = dateText;

  // 2. Preparar Inputs para calcular dolor de procesos (Fase 3)
  const pain1Inputs = {
    horasSemana: dc.pain1?.hours || 0,
    personas: dc.pain1?.persons || 0,
    costoHora: dc.pain1?.costHr || 0,
    leadsPerdidosMes: dc.pain1?.leads || 0,
    ticketPromedio: dc.pain1?.ticket || 0,
    erroresMes: dc.pain1?.errors || 0,
    costoSolucionActualMes: dc.pain1?.tool || 0
  };

  const pain2Inputs = {
    horasSemana: dc.pain2?.hours || 0,
    personas: dc.pain2?.persons || 0,
    costoHora: dc.pain2?.costHr || 0,
    leadsPerdidosMes: dc.pain2?.leads || 0,
    ticketPromedio: dc.pain2?.ticket || 0,
    erroresMes: dc.pain2?.errors || 0,
    costoSolucionActualMes: dc.pain2?.tool || 0
  };

  if (typeof aiFormulas === 'undefined') {
    console.error("Fórmula de cálculo financiero no cargada.");
    return;
  }

  const p1Res = aiFormulas.calcularCostoDolor(pain1Inputs);
  const p2Res = aiFormulas.calcularCostoDolor(pain2Inputs);

  // 3. Priorización multicriterio (Fase 4)
  const prio1Inputs = {
    criticalidad: dc.prio1?.crit || 0,
    velocidadMVP: dc.prio1?.speed || 0,
    liberacionHoras: dc.prio1?.hours || 0,
    mitigacionErrores: dc.prio1?.errors || 0
  };

  const prio2Inputs = {
    criticalidad: dc.prio2?.crit || 0,
    velocidadMVP: dc.prio2?.speed || 0,
    liberacionHoras: dc.prio2?.hours || 0,
    mitigacionErrores: dc.prio2?.errors || 0
  };

  const score1 = aiFormulas.calcularPriorizacion(prio1Inputs);
  const score2 = aiFormulas.calcularPriorizacion(prio2Inputs);

  // 4. Calcular ROI para el Proceso de Sprint Seleccionado
  const sprintChoice = dc.sprintChoice || "1";
  const activePainRes = sprintChoice === "1" ? p1Res : p2Res;
  const activePainInputs = sprintChoice === "1" ? pain1Inputs : pain2Inputs;
  const activeName = sprintChoice === "1" ? (dc.pain1?.name || "Proceso #1") : (dc.pain2?.name || "Proceso #2");

  const hrsLiberadas = parseFloat(activePainInputs.horasSemana) * parseFloat(activePainInputs.personas) || 0;
  const roiInputs = {
    horasLiberadasSemana: hrsLiberadas,
    costoHora: activePainInputs.costoHora,
    leadsRecuperadosMes: dc.roi?.leadsRec || 0,
    ticketPromedio: dc.ticket || activePainInputs.ticketPromedio,
    margenNetoPercent: dc.roi?.marginNet || 0,
    costoRiesgoEvitadoAnual: dc.roi?.riskEvited || 0,
    sprintFee: dc.roi?.sprintFee || 60000
  };

  const roiRes = aiFormulas.calcularROI(roiInputs);

  // 5. Rellenar Widgets KPI del Dashboard
  document.getElementById('dash-pain-total').textContent = `$${Math.round(activePainRes.total).toLocaleString()} MXN`;
  document.getElementById('dash-benefits-total').textContent = `$${Math.round(roiRes.totalBeneficios).toLocaleString()} MXN`;
  
  const dashRoiVal = document.getElementById('dash-roi-percent');
  dashRoiVal.textContent = `${roiRes.roiPercent.toLocaleString()}%`;
  dashRoiVal.style.color = roiRes.roiPercent >= 100 ? 'var(--sage)' : 'var(--brand-deep)';
  
  document.getElementById('dash-payback-months').textContent = `${roiRes.paybackMonths} meses`;

  // 6. Rellenar Ficha del Sprint MVP
  document.getElementById('dash-solution-name').textContent = dc.offer?.solutionName || 'Sistema de Fuerza Laboral IA';
  
  const toolsChecked = [];
  if (dc.offer?.tools) {
    if (dc.offer.tools.make) toolsChecked.push("Make.com");
    if (dc.offer.tools.n8n) toolsChecked.push("n8n");
    if (dc.offer.tools.claude) toolsChecked.push("Claude API");
    if (dc.offer.tools.gpt) toolsChecked.push("GPT-4o");
    if (dc.offer.tools.wa) toolsChecked.push("WhatsApp Business API");
    if (dc.offer.tools.notion) toolsChecked.push("Notion / Airtable");
    if (dc.offer.tools.vapi) toolsChecked.push("Vapi / Retell");
    if (dc.offer.tools.hubspot) toolsChecked.push("HubSpot / GSheets");
  }
  document.getElementById('dash-solution-stack').textContent = toolsChecked.join(', ') || 'No-code low-code';

  const mName = dc.offer?.metricName || 'Métrica';
  const mBase = dc.offer?.metricBase || 'Actual';
  const mGoal = dc.offer?.metricGoal || 'Meta';
  document.getElementById('dash-metric-summary').textContent = `${mName}: ${mBase} ➔ ${mGoal}`;
  document.getElementById('dash-pricing-sprint').textContent = `$${parseFloat(roiInputs.sprintFee).toLocaleString()} MXN`;

  // 7. Rellenar Diagnóstico Comercial & Canales
  document.getElementById('dash-ciudad').textContent = `${dc.ciudad || '-'} — ${dc.operando || '0'} años operando`;
  document.getElementById('dash-empleados').textContent = `${dc.empleadosTotal || '0'} empleados (${dc.empleadosAdmin || '0'} en operaciones/admin)`;
  document.getElementById('dash-crm-erp').textContent = `CRM: ${dc.crm || 'Ninguno'} | ERP/Software: ${dc.erp || 'Ninguno'}`;
  
  const channelsList = [];
  if (dc.channels) {
    if (dc.channels.wa) channelsList.push("WhatsApp");
    if (dc.channels.ig) channelsList.push("Instagram/FB");
    if (dc.channels.tel) channelsList.push("Llamadas");
    if (dc.channels.web) channelsList.push("Sitio Web");
  }
  document.getElementById('dash-canales').textContent = channelsList.join(', ') || 'Ninguno';

  const ticket = parseFloat(dc.ticket) || 0;
  const transacciones = parseFloat(dc.transacciones) || 0;
  const facturacion = parseFloat(dc.facturacion) || 0;
  const metaFacturacion = parseFloat(dc.metaFacturacion) || 0;
  document.getElementById('dash-metrics').textContent = `Ticket: $${ticket.toLocaleString()} MXN | Transacciones: ${transacciones}/mes | Facturación actual: $${facturacion.toLocaleString()} MXN ➔ Meta: $${metaFacturacion.toLocaleString()} MXN/mes`;

  // 8. Cargar cuellos de botella marcados
  const botContainer = document.getElementById('dash-bottlenecks-list');
  botContainer.innerHTML = '';
  if (dc.checkedBots && dc.checkedBots.length > 0) {
    dc.checkedBots.forEach(b => {
      const el = document.createElement('div');
      el.className = 'client-bottleneck-item';
      el.textContent = `✓ ${b}`;
      botContainer.appendChild(el);
    });
  } else {
    botContainer.innerHTML = '<div style="color:var(--mute);">Ningún cuello de botella operativo marcado en la sesión.</div>';
  }

  // 9. Cargar Desglose Financiero
  document.getElementById('dash-time-saved').textContent = `$${Math.round(roiRes.ahorroTiempo).toLocaleString()} MXN / año`;
  document.getElementById('dash-sales-extra').textContent = `$${Math.round(roiRes.ingresosExtra).toLocaleString()} MXN / año`;
  document.getElementById('dash-risks-avoided').textContent = `$${Math.round(roiRes.riesgoEvitado).toLocaleString()} MXN / año`;
  document.getElementById('dash-roi-benefits-total-bottom').textContent = `$${Math.round(roiRes.totalBeneficios).toLocaleString()} MXN / año`;
  document.getElementById('dash-roi-tco-total-bottom').textContent = `$${Math.round(roiRes.tcoTotal).toLocaleString()} MXN`;

  // 10. Inicializar Gráfico Radar de Prioridades
  initRadarChart(dc);

  // 11. Sincronizar todos los valores al layout imprimible (#print-container)
  syncPrintData(diag, p1Res, p2Res, score1, score2, roiRes, activeName);
}

// Inicializar el Gráfico de Chart.js
function initRadarChart(dc) {
  const ctx = document.getElementById('priority-radar-chart');
  if (!ctx) return;

  const p1Name = dc.pain1?.name || "Proceso #1";
  const p2Name = dc.pain2?.name || "Proceso #2";

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
          label: p1Name,
          data: [
            parseFloat(dc.prio1?.crit) || 0,
            parseFloat(dc.prio1?.speed) || 0,
            parseFloat(dc.prio1?.hours) || 0,
            parseFloat(dc.prio1?.errors) || 0
          ],
          backgroundColor: 'rgba(73, 121, 236, 0.2)',
          borderColor: 'rgba(73, 121, 236, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(73, 121, 236, 1)'
        },
        {
          label: p2Name,
          data: [
            parseFloat(dc.prio2?.crit) || 0,
            parseFloat(dc.prio2?.speed) || 0,
            parseFloat(dc.prio2?.hours) || 0,
            parseFloat(dc.prio2?.errors) || 0
          ],
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

// Sincronizar todos los datos al layout de impresión (@media print)
function syncPrintData(diag, p1Res, p2Res, score1, score2, roiRes, activeName) {
  const dc = diag.datos_completos || {};

  document.getElementById('p-meta-folio').textContent = diag.fecha ? `AG-${diag.fecha.replace(/-/g, '')}` : 'AG-2026';
  document.getElementById('p-meta-empresa').textContent = diag.empresa || "Empresa";
  document.getElementById('p-meta-giro').textContent = diag.giro || "Vertical";
  document.getElementById('p-meta-consultor').textContent = diag.consultor || "aiLearning";

  // Datos Comerciales
  const contacto = diag.nombre_contacto || "Contacto";
  const cargo = diag.cargo || "Cargo";
  document.getElementById('p-dat-contacto').textContent = `${contacto} (${cargo})`;
  
  const ciudad = dc.ciudad || "Ciudad";
  const operando = dc.operando || "0";
  document.getElementById('p-dat-ciudad').textContent = `${ciudad} — ${operando} años operando`;

  const totalEmp = dc.empleadosTotal || "0";
  const adminEmp = dc.empleadosAdmin || "0";
  document.getElementById('p-dat-empleados').textContent = `${totalEmp} Empleados totales (${adminEmp} en Admin/Op)`;

  const ticket = parseFloat(dc.ticket) || 0;
  const transaccs = parseFloat(dc.transacciones) || 0;
  document.getElementById('p-dat-metrics').textContent = `Ticket: $${ticket.toLocaleString()} MXN | Transacciones: ${transaccs}/mes`;

  document.getElementById('p-dat-crm').textContent = dc.crm || "No tiene";
  document.getElementById('p-dat-erp').textContent = dc.erp || "No tiene";
  
  // Canales
  const channels = [];
  if (dc.channels?.wa) channels.push("WhatsApp");
  if (dc.channels?.ig) channels.push("Inst/FB");
  if (dc.channels?.tel) channels.push("Llamadas");
  if (dc.channels?.web) channels.push("Web");
  document.getElementById('p-dat-canales').textContent = channels.join(', ') || "Ninguno";

  const factVal = parseFloat(dc.facturacion) || 0;
  const metaVal = parseFloat(dc.metaFacturacion) || 0;
  document.getElementById('p-dat-facturacion').textContent = `Facturación: $${factVal.toLocaleString()} ➔ Meta: $${metaVal.toLocaleString()} MXN/mes`;

  // Cuellos de botella en PDF
  const pChecklist = document.getElementById('print-bottlenecks-list-container');
  pChecklist.innerHTML = '';
  if (dc.checkedBots && dc.checkedBots.length > 0) {
    dc.checkedBots.forEach(b => {
      const row = document.createElement('div');
      row.style.borderBottom = '1px dashed #d8d4cb';
      row.style.padding = '3px 0';
      row.innerHTML = `✓ ${b}`;
      pChecklist.appendChild(row);
    });
  } else {
    pChecklist.innerHTML = '<div style="color:var(--mute);">Ningún cuello de botella marcado hoy.</div>';
  }

  // Costo del dolor (Sección 3)
  const p1Name = dc.pain1?.name || "Proceso #1";
  const p2Name = dc.pain2?.name || "Proceso #2";
  document.getElementById('p-pain1-name').textContent = p1Name;
  document.getElementById('p-pain2-name').textContent = p2Name;

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

  // Priorización (Sección 4)
  document.getElementById('p-lbl-prio-proc1').textContent = p1Name;
  document.getElementById('p-lbl-prio-proc2').textContent = p2Name;
  
  document.getElementById('p-prio1-crit').textContent = dc.prio1?.crit || 0;
  document.getElementById('p-prio2-crit').textContent = dc.prio2?.crit || 0;
  document.getElementById('p-prio1-speed').textContent = dc.prio1?.speed || 0;
  document.getElementById('p-prio2-speed').textContent = dc.prio2?.speed || 0;
  document.getElementById('p-prio1-hours').textContent = dc.prio1?.hours || 0;
  document.getElementById('p-prio2-speed2').textContent = dc.prio2?.hours || 0;
  document.getElementById('p-prio1-errors').textContent = dc.prio1?.errors || 0;
  document.getElementById('p-prio2-errors').textContent = dc.prio2?.errors || 0;
  
  document.getElementById('p-prio1-total').textContent = `${score1.toFixed(2)} / 10`;
  document.getElementById('p-prio2-total').textContent = `${score2.toFixed(2)} / 10`;

  document.getElementById('p-sprint-selected-process').textContent = activeName || "Proceso de Sprint";

  // ROI & TCO (Sección 5)
  document.getElementById('p-roi-time-saved').textContent = `$${Math.round(roiRes.ahorroTiempo).toLocaleString()} MXN`;
  document.getElementById('p-roi-sales-extra').textContent = `$${Math.round(roiRes.ingresosExtra).toLocaleString()} MXN`;
  document.getElementById('p-roi-risk-avoided').textContent = `$${Math.round(roiRes.riesgoEvitado).toLocaleString()} MXN`;
  
  const pRoiVal = document.getElementById('p-roi-percent-value');
  pRoiVal.textContent = `${roiRes.roiPercent.toLocaleString()}%`;
  pRoiVal.style.color = roiRes.roiPercent >= 100 ? '#6B9080' : '#4979EC';
  
  document.getElementById('p-roi-payback-value').textContent = `${roiRes.paybackMonths} meses`;
  document.getElementById('p-pricing-sprint').textContent = `$${Math.round(roiRes.tcoSprint).toLocaleString()} MXN`;

  // Oferta (Sección 6)
  const stack = [];
  if (dc.offer?.tools?.make) stack.push("Make");
  if (dc.offer?.tools?.n8n) stack.push("n8n");
  if (dc.offer?.tools?.claude) stack.push("Claude API");
  if (dc.offer?.tools?.gpt) stack.push("GPT-4o");
  if (dc.offer?.tools?.wa) stack.push("WhatsApp Business API");
  if (dc.offer?.tools?.notion) stack.push("Notion/Airtable");
  if (dc.offer?.tools?.vapi) stack.push("Vapi/Retell");
  if (dc.offer?.tools?.hubspot) stack.push("HubSpot");
  document.getElementById('p-off-stack').textContent = stack.join(', ') || "No-code Stack";

  const omName = dc.offer?.metricName || "Ciclo";
  const omBase = dc.offer?.metricBase || "Base";
  const omGoal = dc.offer?.metricGoal || "Meta";
  document.getElementById('p-off-metric').textContent = `${omName}: ${omBase} ➔ ${omGoal}`;

  // Firmas
  document.getElementById('p-sig-consultor').textContent = dc.offer?.sigConsultor || "aiLearning";
  document.getElementById('p-sig-cliente').textContent = dc.offer?.sigCliente || "Representante de la PyME";
}

// Disparar la impresión nativa (Usa CSS @media print para ocultar el panel de la pantalla y revelar el PDF)
function triggerNativePrint() {
  window.print();
}

// Descargar en PDF local de un solo clic con html2pdf.js
function exportPDF() {
  const element = document.getElementById('print-container');
  // Hacerlo temporalmente visible para que el renderizador de html2pdf lo capture
  element.style.display = 'block';
  
  const companyName = document.getElementById('client-company-name').textContent || 'Empresa';
  const cleanName = companyName.trim().replace(/[^a-zA-Z0-9]/g, '_');
  
  const opt = {
    margin:       0,
    filename:     `aiLearning_Diagnostico_${cleanName}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  
  showToast("⏳ Generando archivo PDF de alta fidelidad...");
  
  html2pdf().set(opt).from(element).save().then(() => {
    element.style.display = 'none'; // ocultar de nuevo en pantalla
    showToast("💾 ¡Reporte PDF guardado y descargado!");
  }).catch(err => {
    console.error(err);
    element.style.display = 'none';
    alert("Hubo un error al generar el PDF del reporte.");
  });
}

// Toast de notificación
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

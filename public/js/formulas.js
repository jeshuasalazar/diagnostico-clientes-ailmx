/**
 * formulas.js
 * Librería compartida para cálculos financieros de aiLearning.
 */

const aiFormulas = {
  // 1. Calcular el costo anual del dolor de un proceso
  calcularCostoDolor: (inputs) => {
    const horasSemana = parseFloat(inputs.horasSemana) || 0;
    const personas = parseFloat(inputs.personas) || 0;
    const costoHora = parseFloat(inputs.costoHora) || 0;
    const leadsPerdidosMes = parseFloat(inputs.leadsPerdidosMes) || 0;
    const ticketPromedio = parseFloat(inputs.ticketPromedio) || 0;
    const erroresMes = parseFloat(inputs.erroresMes) || 0;
    const costoSolucionActualMes = parseFloat(inputs.costoSolucionActualMes) || 0;

    const costoPersonalAnual = horasSemana * personas * costoHora * 4.3 * 12;
    const costoOportunidadesAnual = leadsPerdidosMes * ticketPromedio * 12;
    const costoErroresAnual = erroresMes * 12;
    const costoSolucionAnual = costoSolucionActualMes * 12;

    const costoTotalAnual = costoPersonalAnual + costoOportunidadesAnual + costoErroresAnual + costoSolucionAnual;

    return {
      personal: costoPersonalAnual,
      oportunidades: costoOportunidadesAnual,
      errores: costoErroresAnual,
      solucion: costoSolucionAnual,
      total: costoTotalAnual
    };
  },

  // 2. Calcular el puntaje ponderado de priorización
  calcularPriorizacion: (inputs) => {
    const criticalidad = parseFloat(inputs.criticalidad) || 0;
    const velocidadMVP = parseFloat(inputs.velocidadMVP) || 0;
    const liberacionHoras = parseFloat(inputs.liberacionHoras) || 0;
    const mitigacionErrores = parseFloat(inputs.mitigacionErrores) || 0;

    const score = (criticalidad * 0.35) + (velocidadMVP * 0.25) + (liberacionHoras * 0.20) + (mitigacionErrores * 0.20);
    return Math.round(score * 100) / 100; // Redondear a 2 decimales
  },

  // 3. Calcular la simulación financiera de ROI
  calcularROI: (inputs) => {
    const horasLiberadasSemana = parseFloat(inputs.horasLiberadasSemana) || 0;
    const costoHora = parseFloat(inputs.costoHora) || 0;
    const leadsRecuperadosMes = parseFloat(inputs.leadsRecuperadosMes) || 0;
    const ticketPromedio = parseFloat(inputs.ticketPromedio) || 0;
    const margenNeto = (parseFloat(inputs.margenNetoPercent) || 0) / 100; // Convertir de 0-100 a 0-1
    const costoRiesgoEvitadoAnual = parseFloat(inputs.costoRiesgoEvitadoAnual) || 0;
    const sprintFee = parseFloat(inputs.sprintFee) || 60000;

    // A) Beneficios
    // Ahorro de tiempo con Productividad Fantasma (60% de horas-hombre liberadas reales)
    const ahorroTiempoAnual = horasLiberadasSemana * costoHora * 4.3 * 0.6 * 12;
    // Ingresos extra por conversión comercial aplicando el margen neto del negocio
    const ingresosExtraAnual = leadsRecuperadosMes * ticketPromedio * 12 * margenNeto;
    // Costo del riesgo evitado
    const riesgoEvitadoAnual = costoRiesgoEvitadoAnual;

    const totalBeneficiosAnual = ahorroTiempoAnual + ingresosExtraAnual + riesgoEvitadoAnual;

    // B) TCO (Costo Total de Propiedad)
    const gatewayFee = 15000;
    const consumoAnualAPIs = 15000;
    const tcoTotalAnual = gatewayFee + sprintFee + consumoAnualAPIs;

    // C) Métricas Financieras
    let roiAnualPercent = 0;
    if (tcoTotalAnual > 0) {
      roiAnualPercent = ((totalBeneficiosAnual - tcoTotalAnual) / tcoTotalAnual) * 100;
    }

    let paybackPeriodMonths = 0;
    if (totalBeneficiosAnual > 0) {
      paybackPeriodMonths = tcoTotalAnual / (totalBeneficiosAnual / 12);
    }

    return {
      ahorroTiempo: ahorroTiempoAnual,
      ingresosExtra: ingresosExtraAnual,
      riesgoEvitado: riesgoEvitadoAnual,
      totalBeneficios: totalBeneficiosAnual,
      tcoGateway: gatewayFee,
      tcoSprint: sprintFee,
      tcoAPIs: consumoAnualAPIs,
      tcoTotal: tcoTotalAnual,
      roiPercent: Math.round(roiAnualPercent * 10) / 10, // Redondear a 1 decimal
      paybackMonths: Math.round(paybackPeriodMonths * 10) / 10 // Redondear a 1 decimal
    };
  }
};

// Exportar para Node.js si aplica, de lo contrario disponible en global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = aiFormulas;
} else {
  window.aiFormulas = aiFormulas;
}

/**
 * benchmarks.js
 * Base de datos extendida de verticales para el Motor Adaptativo Sectorial.
 * Contiene dolores, métricas, y valores por defecto (benchmarks) para auto-llenado.
 */

const VERTICALS_DB = {
  Legal: {
    label: "⚖️ Despachos Legales / Abogados",
    refCase: "Destácame (Vambe AI) — Automatizó 100% de atención; ahorro de 1 FTE junior.",
    metric: "Tiempo de revisión (meta: de horas ➔ <30 min por expediente)",
    replace: "Abogado junior o asistente ($18,000–$35,000 MXN/mes)",
    avgCostHr: 150,
    avgTicket: 20000,
    avgMargin: 40,
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
    avgCostHr: 80,
    avgTicket: 5000,
    avgMargin: 30,
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
    avgCostHr: 120,
    avgTicket: 15000,
    avgMargin: 35,
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
    avgCostHr: 60,
    avgTicket: 1500,
    avgMargin: 45,
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
    avgCostHr: 50,
    avgTicket: 500,
    avgMargin: 20,
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
    avgCostHr: 80,
    avgTicket: 8000,
    avgMargin: 30,
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
    avgCostHr: 150,
    avgTicket: 50000,
    avgMargin: 10, // Comisiones
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
    avgCostHr: 50,
    avgTicket: 1200,
    avgMargin: 25,
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
    avgCostHr: 80,
    avgTicket: 10000,
    avgMargin: 25,
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

// Export para uso en navegador
if (typeof window !== 'undefined') {
  window.VERTICALS_DB = VERTICALS_DB;
}

/**
 * Motor de IA Local - Pattern Matching Inteligente
 * 100% gratuito, funciona offline, sin necesidad de API keys
 *
 * Soporta 3 modos:
 * 1. LOCAL: Pattern matching con base de conocimiento
 * 2. GROQ: API gratuita (requiere conexión)
 * 3. OPENAI: GPT-4 (requiere API key de pago)
 */

class AIEngine {
  constructor() {
    this.mode = 'local'; // 'local', 'groq', 'openai', 'xai'
    this.apiKey = null;
    this.dataBridge = null; // Se inyectará desde chat-app.js

    // Sistema de contexto conversacional
    this.conversationHistory = [];
    this.lastIntent = null;
    this.lastData = null;

    // Base de conocimiento: patrones de intenciones
    this.intents = {
      // CONSULTAS DE TRABAJO
      'cuando_trabajo': {
        patterns: [
          /cuándo (voy a )?trabaj(o|ar|aré)/i,
          /qué (día|días) (voy a )?trabaj(o|ar)/i,
          /cuándo (me toca|entro)/i,
          /próxima? jornada/i,
          /cuándo trabajo/i
        ],
        response: 'consultar_oraculo',
        confidence: 0.9
      },

      // POSICIÓN EN CENSO
      'posicion': {
        patterns: [
          /mi posición/i,
          /qué posición (tengo|estoy)/i,
          /cuántas? posiciones? (me quedan?|faltan?)/i,
          /dónde estoy (en el )?censo/i,
          /a cuántas? posiciones? estoy/i,
          /cuánto falta para (que )?(trabaje|entrar)/i
        ],
        response: 'consultar_posicion',
        confidence: 0.9
      },

      // JORNALES
      'jornales': {
        patterns: [
          /cuántos? jornales? (tengo|llevo)/i,
          /mis jornales/i,
          /jornales? (de la|esta) quincena/i,
          /cuánto(s)? (días )?(he )?trabajado/i,
          /ver (mis )?jornales/i
        ],
        response: 'consultar_jornales',
        confidence: 0.9
      },

      // SALARIO
      'salario': {
        patterns: [
          /cuánto (voy a )?cobr(o|ar|aré)/i,
          /mi (sueldo|salario)/i,
          /cuánto (llevo )?ganado/i,
          /sueldómetro/i,
          /dinero/i,
          /nómina/i
        ],
        response: 'consultar_salario',
        confidence: 0.9
      },

      // SALARIO ANUAL
      'salario_anual': {
        patterns: [
          /cuánto (llevo|he) ganado (este|el) año/i,
          /total (del )?año/i,
          /ganancia anual/i,
          /salario anual/i,
          /ganado (este|en el) año/i,
          /llevo ganado.*año/i
        ],
        response: 'consultar_salario_anual',
        confidence: 0.9
      },

      // JORNAL MÁS ALTO
      'jornal_maximo': {
        patterns: [
          /(cuál|cual) (es|fue) (el|mi) jornal más alto/i,
          /jornal (más|mas) alto/i,
          /mejor jornal/i,
          /máximo jornal/i
        ],
        response: 'consultar_jornal_maximo',
        confidence: 0.9
      },

      // PRIMA MÁS ALTA
      'prima_maxima': {
        patterns: [
          /(cuál|cual) (es|fue) (la|mi) prima más alta/i,
          /prima (más|mas) alta/i,
          /mejor prima/i,
          /máxima prima/i
        ],
        response: 'consultar_prima_maxima',
        confidence: 0.9
      },

      // DÓNDE TRABAJO HOY
      'donde_trabajo': {
        patterns: [
          /dónde trabaj(o|aré) (hoy|mañana)/i,
          /en qué empresa/i,
          /qué (especialidad|puesto)/i,
          /mi contratación/i,
          /dónde (me han contratado|estoy contratado)/i,
          /trabaj(o|as) hoy/i,
          /^hoy.*trabaj/i
        ],
        response: 'consultar_contratacion',
        confidence: 0.9
      },

      // PUERTAS
      'puertas': {
        patterns: [
          /puertas? (del día|de hoy|de mañana)/i,
          /cuál(es)? (es|son) las? puertas?/i,
          /ver puertas?/i
        ],
        response: 'consultar_puertas',
        confidence: 0.9
      },

      // ACCIONES - NO DISPONIBLE
      'no_disponible': {
        patterns: [
          /poner(me)? no disponible/i,
          /(abrir?|abreme|abre) (el )?formulario (de )?no disponibilidad/i,
          /no (puedo|voy a) trabajar/i,
          /reportar ausencia/i,
          /^no disponible$/i,
          /(quiero|voy a) poner(me)? no disponible/i,
          /ponme no disponible/i,
          /^no disponible/i,
          /disponible$/i
        ],
        response: 'abrir_no_disponible',
        confidence: 0.9
      },

      // ACCIONES - PUNTO Y HS
      'punto': {
        patterns: [
          /poner(me)? (el )?punto/i,
          /(abrir?|abreme|abre) (el )?punto (y )?h\.?s\.?/i,
          /marcar (el )?punto/i,
          /(quiero|voy a) poner(me)? (el )?punto/i,
          /ponme (el )?punto/i
        ],
        response: 'abrir_punto',
        confidence: 0.85
      },

      // VER CONTRATACIÓN (SPREADSHEET)
      'ver_contratacion': {
        patterns: [
          /ver (la )?contrataci(ó|o)n/i,
          /(abrir?|abreme|abre|ver) (la )?(hoja|planilla) (de )?contrataci(ó|o)n/i,
          /contrataciones? del d(í|i)a/i
        ],
        response: 'abrir_contratacion',
        confidence: 0.85
      },

      // VER CHAPERO
      'ver_chapero': {
        patterns: [
          /ver (el )?chapero/i,
          /(abrir?|abreme|abre|ver) (el )?censo/i,
          /lista (de )?trabajadores/i,
          /chapas?/i
        ],
        response: 'abrir_chapero',
        confidence: 0.85
      },

      // COMUNICACIONES OFICINA
      'comunicaciones': {
        patterns: [
          /comunicaciones? (de la )?oficina/i,
          /(abrir?|abreme|abre) comunicaciones?/i,
          /formulario comunicaci(ó|o)n/i
        ],
        response: 'abrir_comunicaciones',
        confidence: 0.85
      },

      // SALUDOS
      'saludo': {
        patterns: [
          /^hola/i,
          /^buenos? (días?|tardes?|noches?)/i,
          /^hey/i,
          /^buenas/i,
          /qué tal/i
        ],
        response: 'saludo',
        confidence: 0.95
      },

      // AYUDA
      'ayuda': {
        patterns: [
          /ayuda/i,
          /qué puedes hacer/i,
          /cómo funciona(s)?/i,
          /qué sabes/i,
          /comandos/i
        ],
        response: 'ayuda',
        confidence: 0.9
      },

      // SEGUIMIENTO / MÁS INFORMACIÓN
      'seguimiento': {
        patterns: [
          /^(dame|dime|muestra|enseña) (los?|el|la|las)? ?(detalles?|información|info|datos)/i,
          /^(más|mas) (detalles?|información|info)/i,
          /^cuéntame más/i,
          /^amplía/i,
          /^explica/i,
          /^y (eso|esto)\??$/i,
          /^(detalles?|información|info)$/i
        ],
        response: 'ampliar_informacion',
        confidence: 0.95
      },

      // RESPUESTAS AFIRMATIVAS
      'afirmativo': {
        patterns: [
          /^sí$/i,
          /^si$/i,
          /^vale$/i,
          /^ok$/i,
          /^okay$/i,
          /^claro$/i,
          /^adelante$/i,
          /^perfecto$/i,
          /^de acuerdo$/i,
          /^por supuesto$/i,
          /^venga$/i,
          /^dale$/i
        ],
        response: 'confirmar_accion',
        confidence: 0.95
      }
    };

    // Respuestas predefinidas
    this.responses = {
      saludo: [
        "¡Hola! 👋 ¿En qué puedo ayudarte hoy?",
        "¡Buenas! ¿Qué necesitas saber?",
        "¡Hola! Estoy aquí para ayudarte con tus consultas del puerto."
      ],
      ayuda: `Puedo ayudarte con:

📅 **Consultar cuándo trabajas**: "¿Cuándo voy a trabajar?"
📊 **Ver tus jornales**: "¿Cuántos jornales llevo esta quincena?"
💰 **Consultar tu salario**: "¿Cuánto llevo ganado?"
🎯 **Tu posición**: "¿A cuántas posiciones estoy?"
🚢 **Dónde trabajas hoy**: "¿En qué empresa trabajo?"
🔗 **Abrir formularios**: "Ábreme el formulario de no disponibilidad"

¿Qué quieres saber?`,
      no_entiendo: "Lo siento, no entendí tu pregunta. Intenta preguntarme sobre tus jornales, salario, posición o cuándo trabajas.",
      error_datos: "No pude obtener esos datos en este momento. Por favor, intenta de nuevo.",
      sin_datos: "No encontré datos para esa consulta."
    };
  }

  /**
   * Inicializa el motor de IA
   */
  async initialize(dataBridge) {
    this.dataBridge = dataBridge;

    // Cargar configuración guardada
    const savedMode = localStorage.getItem('ai_mode');
    const savedApiKey = localStorage.getItem('ai_api_key');

    if (savedMode) {
      this.mode = savedMode;
    }

    if (savedApiKey) {
      this.apiKey = savedApiKey;
    }

    console.log('✅ Motor de IA inicializado en modo:', this.mode);
  }

  /**
   * Procesa un mensaje del usuario y genera una respuesta
   */
  async processMessage(userMessage) {
    console.log('🤖 Procesando mensaje:', userMessage);

    // Limpiar mensaje
    const cleanMessage = userMessage.trim().toLowerCase();

    if (!cleanMessage) {
      return {
        text: this.responses.no_entiendo,
        intent: 'unknown',
        confidence: 0
      };
    }

    // Detectar intención
    let intent = this.detectIntent(cleanMessage);
    console.log('🎯 Intención detectada:', intent);

    // Si pide más información/detalles, usar el último intent
    if (intent.action === 'ampliar_informacion' && this.lastIntent) {
      console.log('📖 Ampliando información del último intent:', this.lastIntent.action);
      intent = this.lastIntent; // Reutilizar el último intent
    }

    // SIEMPRE generar respuesta local primero (con datos reales)
    const localResponse = await this.generateLocalResponse(intent, userMessage);

    // Guardar el intent y datos para próximas consultas
    this.lastIntent = intent;
    this.lastData = localResponse.data;

    // Si estamos en modo Groq y hay datos, mejorar la redacción
    if (this.mode === 'groq' && this.apiKey && localResponse.data) {
      return await this.enhanceWithGroq(localResponse, userMessage);
    }

    return localResponse;
  }

  /**
   * Detecta la intención del usuario mediante pattern matching
   */
  detectIntent(message) {
    let bestMatch = null;
    let highestConfidence = 0;

    // Comparar con todos los patrones
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      for (const pattern of intentData.patterns) {
        if (pattern.test(message)) {
          if (intentData.confidence > highestConfidence) {
            highestConfidence = intentData.confidence;
            bestMatch = {
              name: intentName,
              action: intentData.response,
              confidence: intentData.confidence
            };
          }
        }
      }
    }

    return bestMatch || { name: 'unknown', action: 'unknown', confidence: 0 };
  }

  /**
   * Genera respuesta usando motor local (pattern matching)
   */
  async generateLocalResponse(intent, userMessage) {
    if (intent.action === 'saludo') {
      return {
        text: this.getRandomResponse(this.responses.saludo),
        intent: intent.name,
        confidence: intent.confidence
      };
    }

    if (intent.action === 'ayuda') {
      return {
        text: this.responses.ayuda,
        intent: intent.name,
        confidence: intent.confidence
      };
    }

    if (intent.action === 'confirmar_accion') {
      // Verificar si hay detalles de jornales pendientes
      const jornalesDetail = localStorage.getItem('pending_jornales_detail');

      if (jornalesDetail) {
        const jornales = JSON.parse(jornalesDetail);
        localStorage.removeItem('pending_jornales_detail');

        let respuesta = `📋 **Detalles completos de jornales:**\n\n`;

        for (const jornal of jornales) {
          const fecha = jornal.fecha ? new Date(jornal.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '-';
          respuesta += `**${fecha}**\n`;
          respuesta += `  • Empresa: ${jornal.empresa || 'N/A'}\n`;
          respuesta += `  • Puesto: ${jornal.puesto || 'N/A'}\n`;
          respuesta += `  • Jornada: ${jornal.jornada || 'N/A'}\n`;
          if (jornal.buque) respuesta += `  • Buque: ${jornal.buque}\n`;
          respuesta += `\n`;
        }

        return {
          text: respuesta,
          intent: intent.name,
          confidence: intent.confidence
        };
      }

      // Si el usuario dice "sí", ejecutar la última acción pendiente
      const lastAction = localStorage.getItem('pending_action');

      if (lastAction) {
        const action = JSON.parse(lastAction);
        localStorage.removeItem('pending_action'); // Limpiar

        return {
          text: "¡Perfecto! Abriendo...",
          intent: intent.name,
          confidence: intent.confidence,
          action: action
        };
      } else {
        return {
          text: "¡Vale! ¿En qué más puedo ayudarte?",
          intent: intent.name,
          confidence: intent.confidence
        };
      }
    }

    // Consultas que requieren datos
    if (intent.action === 'consultar_oraculo') {
      return await this.handleOraculoQuery();
    }

    if (intent.action === 'consultar_posicion') {
      return await this.handlePosicionQuery();
    }

    if (intent.action === 'consultar_jornales') {
      return await this.handleJornalesQuery();
    }

    if (intent.action === 'consultar_salario') {
      return await this.handleSalarioQuery();
    }

    if (intent.action === 'consultar_salario_anual') {
      return await this.handleSalarioAnualQuery();
    }

    if (intent.action === 'consultar_jornal_maximo') {
      return await this.handleJornalMaximoQuery();
    }

    if (intent.action === 'consultar_prima_maxima') {
      return await this.handlePrimaMaximaQuery();
    }

    if (intent.action === 'consultar_contratacion') {
      return await this.handleContratacionQuery();
    }

    if (intent.action === 'consultar_puertas') {
      return await this.handlePuertasQuery();
    }

    // Acciones
    if (intent.action === 'abrir_no_disponible') {
      return {
        text: "Claro, te abro el formulario de no disponibilidad.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSfXcs0lOG7beU9HMfum-6eKkwmZCjcvnOQXaFiiY8EAb9rpYA/closedform'
        }
      };
    }

    if (intent.action === 'abrir_punto') {
      return {
        text: "Te abro el formulario para marcar el punto.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSeGKl5gwKrcj110D_6xhHVo0bn7Fo56tneof68dRyS6xUrD7Q/viewform'
        }
      };
    }

    if (intent.action === 'abrir_contratacion') {
      return {
        text: "Te abro la hoja de contratación del día.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pubhtml?gid=1388412839&single=true'
        }
      };
    }

    if (intent.action === 'abrir_chapero') {
      return {
        text: "Te abro el chapero (censo de trabajadores).",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pubhtml?gid=841547354&single=true'
        }
      };
    }

    if (intent.action === 'abrir_comunicaciones') {
      return {
        text: "Te abro el formulario de comunicaciones con la oficina.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSc_wN20zG_88wmAAyXRsCxokTpfvxRKdILHr5BxrQUuNGqvyQ/closedform'
        }
      };
    }

    // No entendido
    return {
      text: this.responses.no_entiendo,
      intent: 'unknown',
      confidence: 0
    };
  }

  /**
   * Handlers para cada tipo de consulta
   */
  async handleOraculoQuery() {
    try {
      const chapa = localStorage.getItem('currentChapa');

      if (!chapa) {
        return {
          text: "Para consultar el Oráculo necesito que inicies sesión primero.",
          intent: 'consultar_oraculo',
          confidence: 0.9
        };
      }

      // Obtener posición actual y puertas
      const posicion = await this.dataBridge.getPosicionUsuario();
      const puertas = await this.dataBridge.getPuertas();

      if (!posicion) {
        return {
          text: "No pude obtener tu posición en el censo.",
          intent: 'consultar_oraculo',
          confidence: 0.9
        };
      }

      // Crear respuesta informativa
      let respuesta = `📊 **Tu situación actual:**\n\n`;
      respuesta += `🎯 Posición en censo: **${posicion.posicion}**\n`;

      if (posicion.posicionesLaborable) {
        respuesta += `📍 A **${posicion.posicionesLaborable}** posiciones de la puerta laborable\n`;
      }

      if (posicion.posicionesFestiva) {
        respuesta += `🎪 A **${posicion.posicionesFestiva}** posiciones de la puerta festiva\n`;
      }

      if (puertas && puertas.length > 0) {
        respuesta += `\n🚪 **Puertas de hoy:**\n`;
        for (const puerta of puertas) {
          respuesta += `  • ${puerta.jornada}: SP=${puerta.sp}, OC=${puerta.oc}\n`;
        }
      }

      respuesta += `\n💡 Para ver la predicción completa y probabilidades, puedo abrirte el Oráculo completo. ¿Lo abro?`;

      // Guardar acción pendiente
      const pendingAction = {
        type: 'navigate_pwa',
        page: 'calculadora'
      };
      localStorage.setItem('pending_action', JSON.stringify(pendingAction));

      return {
        text: respuesta,
        intent: 'consultar_oraculo',
        confidence: 0.9,
        data: {
          type: 'oraculo',
          posicion: posicion.posicion,
          posicionesLaborable: posicion.posicionesLaborable,
          posicionesFestiva: posicion.posicionesFestiva,
          puertas: puertas
        }
      };

    } catch (error) {
      console.error('Error en handleOraculoQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'consultar_oraculo',
        confidence: 0.9
      };
    }
  }

  async handlePosicionQuery() {
    try {
      const posicion = await this.dataBridge.getPosicionUsuario();

      if (!posicion) {
        return {
          text: this.responses.sin_datos,
          intent: 'posicion',
          confidence: 0.9
        };
      }

      return {
        text: `Tu posición actual en el censo es: **${posicion.posicion}**`,
        intent: 'posicion',
        confidence: 0.9,
        data: {
          type: 'posicion',
          posicion: posicion.posicion,
          laborable: posicion.posicionesLaborable,
          festiva: posicion.posicionesFestiva
        }
      };

    } catch (error) {
      console.error('Error en handlePosicionQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'posicion',
        confidence: 0.9
      };
    }
  }

  async handleJornalesQuery() {
    try {
      const jornales = await this.dataBridge.getJornalesQuincena();

      if (!jornales || jornales.total === 0) {
        return {
          text: "No encontré jornales registrados en esta quincena.",
          intent: 'jornales',
          confidence: 0.9
        };
      }

      // Crear resumen de jornales
      let respuesta = `📊 **${jornales.quincena}**: llevas **${jornales.total} jornales**\n\n`;

      // Mostrar los primeros 5 jornales como resumen
      const jornalesParaMostrar = jornales.jornales.slice(0, 5);

      respuesta += `**Últimos jornales:**\n`;
      for (const jornal of jornalesParaMostrar) {
        const fecha = jornal.fecha ? new Date(jornal.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '-';
        respuesta += `• ${fecha} - ${jornal.empresa || 'N/A'} (${jornal.jornada || 'N/A'})\n`;
      }

      if (jornales.total > 5) {
        respuesta += `\n_...y ${jornales.total - 5} jornales más_\n`;
      }

      // Guardar acción pendiente para mostrar todos los detalles
      localStorage.setItem('pending_jornales_detail', JSON.stringify(jornales.jornales));

      respuesta += `\n¿Quieres ver todos los detalles?`;

      return {
        text: respuesta,
        intent: 'jornales',
        confidence: 0.9,
        data: {
          type: 'jornales',
          total: jornales.total,
          quincena: jornales.quincena,
          jornales: jornales.jornales
        }
      };

    } catch (error) {
      console.error('Error en handleJornalesQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'jornales',
        confidence: 0.9
      };
    }
  }

  async handleSalarioQuery() {
    try {
      const salario = await this.dataBridge.getSalarioQuincena();

      if (!salario) {
        return {
          text: this.responses.sin_datos,
          intent: 'salario',
          confidence: 0.9
        };
      }

      return {
        text: `Esta quincena llevas acumulado aproximadamente **${salario.bruto}€ brutos** (${salario.neto}€ netos).`,
        intent: 'salario',
        confidence: 0.9,
        data: {
          type: 'salario',
          bruto: salario.bruto,
          neto: salario.neto,
          quincena: salario.quincena
        }
      };

    } catch (error) {
      console.error('Error en handleSalarioQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'salario',
        confidence: 0.9
      };
    }
  }

  async handleContratacionQuery() {
    try {
      const contratacion = await this.dataBridge.getContratacionHoy();

      if (!contratacion) {
        return {
          text: "No encontré contratación para hoy.",
          intent: 'donde_trabajo',
          confidence: 0.9
        };
      }

      return {
        text: `Hoy trabajas en **${contratacion.empresa}** como **${contratacion.puesto}**.`,
        intent: 'donde_trabajo',
        confidence: 0.9,
        data: {
          type: 'contratacion',
          empresa: contratacion.empresa,
          puesto: contratacion.puesto,
          jornada: contratacion.jornada,
          buque: contratacion.buque
        }
      };

    } catch (error) {
      console.error('Error en handleContratacionQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'donde_trabajo',
        confidence: 0.9
      };
    }
  }

  async handlePuertasQuery() {
    try {
      const puertas = await this.dataBridge.getPuertas();

      if (!puertas || puertas.length === 0) {
        return {
          text: this.responses.sin_datos,
          intent: 'puertas',
          confidence: 0.9
        };
      }

      return {
        text: "Aquí tienes las puertas de hoy:",
        intent: 'puertas',
        confidence: 0.9,
        data: {
          type: 'puertas',
          puertas: puertas
        }
      };

    } catch (error) {
      console.error('Error en handlePuertasQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'puertas',
        confidence: 0.9
      };
    }
  }

  async handleSalarioAnualQuery() {
    try {
      const jornales = await this.dataBridge.getJornalesAnuales();

      if (!jornales || jornales.length === 0) {
        return {
          text: "No encontré jornales registrados este año.",
          intent: 'salario_anual',
          confidence: 0.9
        };
      }

      // Estimación simple: 150€ brutos por jornal
      const estimacionBruto = jornales.length * 150;
      const estimacionNeto = Math.round(estimacionBruto * 0.85);

      return {
        text: `Este año llevas **${jornales.length} jornales** trabajados.\n\nGanancias estimadas: **${estimacionBruto}€ brutos** (${estimacionNeto}€ netos).`,
        intent: 'salario_anual',
        confidence: 0.9,
        data: {
          type: 'salario_anual',
          jornales: jornales.length,
          bruto: estimacionBruto,
          neto: estimacionNeto
        }
      };

    } catch (error) {
      console.error('Error en handleSalarioAnualQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'salario_anual',
        confidence: 0.9
      };
    }
  }

  async handleJornalMaximoQuery() {
    try {
      const jornales = await this.dataBridge.getJornalesQuincena();

      if (!jornales || jornales.total === 0) {
        return {
          text: "No encontré jornales en esta quincena.",
          intent: 'jornal_maximo',
          confidence: 0.9
        };
      }

      // Analizar jornales para encontrar el más alto
      let maxJornal = null;
      let maxValor = 0;

      for (const jornal of jornales.jornales) {
        // Estimación: jornada completa = 150€, media = 75€
        let valor = jornal.jornada === 'COMPLETA' ? 150 : 75;

        if (valor > maxValor) {
          maxValor = valor;
          maxJornal = jornal;
        }
      }

      if (!maxJornal) {
        return {
          text: "No pude determinar el jornal más alto.",
          intent: 'jornal_maximo',
          confidence: 0.9
        };
      }

      return {
        text: `Tu jornal más alto esta quincena fue de aproximadamente **${maxValor}€**\n\nEmpresa: ${maxJornal.empresa}\nPuesto: ${maxJornal.puesto}\nJornada: ${maxJornal.jornada}`,
        intent: 'jornal_maximo',
        confidence: 0.9
      };

    } catch (error) {
      console.error('Error en handleJornalMaximoQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'jornal_maximo',
        confidence: 0.9
      };
    }
  }

  async handlePrimaMaximaQuery() {
    try {
      const jornales = await this.dataBridge.getJornalesQuincena();

      if (!jornales || jornales.total === 0) {
        return {
          text: "No encontré jornales con primas en esta quincena.",
          intent: 'prima_maxima',
          confidence: 0.9
        };
      }

      // Por ahora, respuesta genérica ya que no tenemos datos de primas
      return {
        text: "Esta funcionalidad requiere datos de primas que aún no están disponibles en el sistema. Contacta con el administrador para más información.",
        intent: 'prima_maxima',
        confidence: 0.9
      };

    } catch (error) {
      console.error('Error en handlePrimaMaximaQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'prima_maxima',
        confidence: 0.9
      };
    }
  }

  /**
   * Mejora una respuesta local con Groq (sin inventar datos)
   */
  async enhanceWithGroq(localResponse, userMessage) {
    try {
      console.log('✨ Mejorando respuesta con Groq...');

      const systemPrompt = `Eres un asistente virtual del Puerto de Valencia.
Tu trabajo es reformular la respuesta de forma más amigable y natural, pero NUNCA inventar datos.
Usa EXACTAMENTE los datos proporcionados, solo mejora la redacción.`;

      const userPrompt = `El usuario preguntó: "${userMessage}"

Los datos REALES son:
${localResponse.text}

Reformula esta respuesta de forma amigable pero SIN cambiar ningún dato numérico.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3, // Baja temperatura para menos creatividad
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const enhancedText = data.choices[0].message.content;

      console.log('✅ Respuesta mejorada con Groq');

      return {
        ...localResponse,
        text: enhancedText
      };

    } catch (error) {
      console.error('❌ Error mejorando con Groq:', error);
      // Si falla, devolver respuesta local original
      return localResponse;
    }
  }

  /**
   * Genera respuesta usando Groq API (gratuita)
   */
  async generateGroqResponse(intent, userMessage) {
    if (!this.apiKey) {
      console.warn('⚠️ Groq API key no configurada, usando modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }

    try {
      console.log('🤖 Usando Groq API para responder');

      // Construir contexto basado en la intención detectada
      let systemPrompt = `Eres un asistente virtual para trabajadores del Puerto de Valencia.
Respondes de forma amigable, concisa y clara en español.
Puedes consultar datos de jornales, posición en censo, salarios y contrataciones.`;

      let userPrompt = userMessage;

      // Si tenemos datos de la intención, añadirlos al contexto
      if (intent.action === 'consultar_jornales') {
        const jornales = await this.dataBridge.getJornalesQuincena();
        if (jornales) {
          systemPrompt += `\n\nDatos disponibles: El usuario tiene ${jornales.total} jornales en ${jornales.quincena}.`;
        }
      } else if (intent.action === 'consultar_posicion') {
        const posicion = await this.dataBridge.getPosicionUsuario();
        if (posicion) {
          systemPrompt += `\n\nDatos disponibles: El usuario está en la posición ${posicion.posicion} del censo.`;
          if (posicion.posicionesLaborable) {
            systemPrompt += ` Está a ${posicion.posicionesLaborable} posiciones de la puerta laborable.`;
          }
        }
      } else if (intent.action === 'consultar_salario') {
        const salario = await this.dataBridge.getSalarioQuincena();
        if (salario) {
          systemPrompt += `\n\nDatos disponibles: El usuario lleva ganado aproximadamente ${salario.bruto}€ brutos (${salario.neto}€ netos) en ${salario.quincena}.`;
        }
      } else if (intent.action === 'consultar_contratacion') {
        const contratacion = await this.dataBridge.getContratacionHoy();
        if (contratacion) {
          systemPrompt += `\n\nDatos disponibles: Hoy trabaja en ${contratacion.empresa} como ${contratacion.puesto}, jornada ${contratacion.jornada}.`;
        }
      }

      // Llamar a Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Modelo rápido y gratuito
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      console.log('✅ Respuesta de Groq:', aiResponse);

      return {
        text: aiResponse,
        intent: intent.name,
        confidence: intent.confidence
      };

    } catch (error) {
      console.error('❌ Error con Groq API:', error);
      console.warn('⏳ Fallback a modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }
  }

  /**
   * Genera respuesta usando xAI (Grok)
   */
  async generateXAIResponse(intent, userMessage) {
    if (!this.apiKey) {
      console.warn('⚠️ xAI API key no configurada, usando modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }

    try {
      console.log('🤖 Usando xAI (Grok) para responder');

      // Construir contexto basado en la intención detectada
      let systemPrompt = `Eres un asistente virtual para trabajadores del Puerto de Valencia.
Respondes de forma amigable, concisa y clara en español.
Puedes consultar datos de jornales, posición en censo, salarios y contrataciones.
Tu nombre es "Asistente IA del Puerto de Valencia".`;

      let userPrompt = userMessage;

      // Si tenemos datos de la intención, añadirlos al contexto
      if (intent.action === 'consultar_jornales') {
        const jornales = await this.dataBridge.getJornalesQuincena();
        if (jornales) {
          systemPrompt += `\n\nDatos disponibles: El usuario tiene ${jornales.total} jornales en ${jornales.quincena}.`;
        }
      } else if (intent.action === 'consultar_posicion') {
        const posicion = await this.dataBridge.getPosicionUsuario();
        if (posicion) {
          systemPrompt += `\n\nDatos disponibles: El usuario está en la posición ${posicion.posicion} del censo.`;
          if (posicion.posicionesLaborable) {
            systemPrompt += ` Está a ${posicion.posicionesLaborable} posiciones de la puerta laborable.`;
          }
        }
      } else if (intent.action === 'consultar_salario') {
        const salario = await this.dataBridge.getSalarioQuincena();
        if (salario) {
          systemPrompt += `\n\nDatos disponibles: El usuario lleva ganado aproximadamente ${salario.bruto}€ brutos (${salario.neto}€ netos) en ${salario.quincena}.`;
        }
      } else if (intent.action === 'consultar_contratacion') {
        const contratacion = await this.dataBridge.getContratacionHoy();
        if (contratacion) {
          systemPrompt += `\n\nDatos disponibles: Hoy trabaja en ${contratacion.empresa} como ${contratacion.puesto}, jornada ${contratacion.jornada}.`;
        }
      }

      // Llamar a xAI API (compatible con OpenAI)
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`xAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      console.log('✅ Respuesta de xAI (Grok):', aiResponse);

      return {
        text: aiResponse,
        intent: intent.name,
        confidence: intent.confidence
      };

    } catch (error) {
      console.error('❌ Error con xAI API:', error);
      console.warn('⏳ Fallback a modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }
  }

  /**
   * Genera respuesta usando OpenAI GPT
   */
  async generateOpenAIResponse(intent, userMessage) {
    // TODO: Implementar cuando se configure OpenAI
    console.warn('⚠️ OpenAI no configurado aún, usando modo local');
    return await this.generateLocalResponse(intent, userMessage);
  }

  /**
   * Utilidades
   */
  getRandomResponse(responses) {
    if (Array.isArray(responses)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return responses;
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem('ai_mode', mode);
    console.log('🔄 Modo de IA cambiado a:', mode);
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('ai_api_key', apiKey);
    console.log('🔑 API Key guardada');
  }
}

// Exportar
window.AIEngine = AIEngine;

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
    this.mode = 'local'; // 'local', 'groq', 'openai'
    this.apiKey = null;
    this.dataBridge = null; // Se inyectará desde chat-app.js

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

      // DÓNDE TRABAJO HOY
      'donde_trabajo': {
        patterns: [
          /dónde trabaj(o|aré) (hoy|mañana)/i,
          /en qué empresa/i,
          /qué (especialidad|puesto)/i,
          /mi contratación/i,
          /dónde (me han contratado|estoy contratado)/i
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
          /(abrir?|abreme) (el )?formulario (de )?no disponibilidad/i,
          /no puedo trabajar/i,
          /reportar ausencia/i
        ],
        response: 'abrir_no_disponible',
        confidence: 0.85
      },

      // ACCIONES - PUNTO Y HS
      'punto': {
        patterns: [
          /poner(me)? (el )?punto/i,
          /(abrir?|abreme) punto (y )?h\.?s\.?/i,
          /marcar punto/i
        ],
        response: 'abrir_punto',
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
    const intent = this.detectIntent(cleanMessage);
    console.log('🎯 Intención detectada:', intent);

    // Generar respuesta según el modo
    if (this.mode === 'local') {
      return await this.generateLocalResponse(intent, userMessage);
    } else if (this.mode === 'groq') {
      return await this.generateGroqResponse(intent, userMessage);
    } else if (this.mode === 'openai') {
      return await this.generateOpenAIResponse(intent, userMessage);
    }

    return {
      text: this.responses.no_entiendo,
      intent: 'unknown',
      confidence: 0
    };
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
          url: 'https://noray.cpevalencia.com/NoDisponibilidad.asp'
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
          url: 'https://noray.cpevalencia.com/PuntoMano.asp'
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
      // Obtener predicción del Oráculo (simular por ahora)
      const chapa = localStorage.getItem('currentChapa');

      if (!chapa) {
        return {
          text: "Para consultar el Oráculo necesito que inicies sesión primero.",
          intent: 'consultar_oraculo',
          confidence: 0.9
        };
      }

      // Guardar acción pendiente para cuando el usuario confirme
      const pendingAction = {
        type: 'navigate_pwa',
        page: 'calculadora'
      };
      localStorage.setItem('pending_action', JSON.stringify(pendingAction));

      return {
        text: "Para ver tu predicción de entrada, necesitas consultar el Oráculo en la PWA principal. ¿Te abro el Oráculo?",
        intent: 'consultar_oraculo',
        confidence: 0.9
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

      return {
        text: `Esta quincena llevas **${jornales.total} jornales** trabajados.`,
        intent: 'jornales',
        confidence: 0.9,
        data: {
          type: 'jornales',
          total: jornales.total,
          quincena: jornales.quincena
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

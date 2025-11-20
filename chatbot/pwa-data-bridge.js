/**
 * PWA Data Bridge
 * Puente para acceder a los datos de la PWA principal desde el chatbot
 * Utiliza Supabase compartido y localStorage
 */

class PWADataBridge {
  constructor() {
    this.supabase = null;
    this.currentChapa = null;
  }

  /**
   * Inicializa el puente de datos
   */
  async initialize() {
    // Inicializar Supabase (compartido con PWA principal)
    if (typeof initSupabase === 'function') {
      initSupabase();
      this.supabase = window.supabase;
    }

    // Obtener chapa del usuario actual
    this.currentChapa = localStorage.getItem('currentChapa');

    if (!this.currentChapa) {
      console.warn('⚠️ No hay usuario logueado');
      return false;
    }

    console.log('✅ PWA Data Bridge inicializado para chapa:', this.currentChapa);
    return true;
  }

  /**
   * Obtiene la posición del usuario en el censo
   */
  async getPosicionUsuario() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Obtener posición usando SheetsAPI
      if (!window.SheetsAPI) {
        throw new Error('SheetsAPI no disponible');
      }

      const posicion = await window.SheetsAPI.getPosicionChapa(this.currentChapa);
      const posicionesHasta = await window.SheetsAPI.getPosicionesHastaContratacion(this.currentChapa);

      return {
        posicion: posicion,
        posicionesLaborable: posicionesHasta?.laborable || null,
        posicionesFestiva: posicionesHasta?.festiva || null
      };

    } catch (error) {
      console.error('❌ Error obteniendo posición:', error);
      return null;
    }
  }

  /**
   * Obtiene los jornales de la quincena actual
   */
  async getJornalesQuincena() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Calcular rango de fechas de la quincena actual
      const hoy = new Date();
      const dia = hoy.getDate();

      let fechaInicio, fechaFin;

      if (dia <= 15) {
        // Primera quincena
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), 15);
      } else {
        // Segunda quincena
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 16);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      }

      // Formatear fechas a ISO
      const fechaInicioISO = this.formatDateToISO(fechaInicio);
      const fechaFinISO = this.formatDateToISO(fechaFin);

      // Obtener jornales
      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        fechaInicioISO,
        fechaFinISO,
        null
      );

      return {
        total: jornales.length,
        jornales: jornales,
        quincena: dia <= 15 ? 'Primera quincena' : 'Segunda quincena'
      };

    } catch (error) {
      console.error('❌ Error obteniendo jornales:', error);
      return null;
    }
  }

  /**
   * Obtiene el salario estimado de la quincena actual
   */
  async getSalarioQuincena() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      const jornalesData = await this.getJornalesQuincena();

      if (!jornalesData || jornalesData.total === 0) {
        return null;
      }

      // Estimación simple: 150€ brutos por jornal (promedio)
      // TODO: Usar el cálculo real del sueldómetro
      const estimacionBruto = jornalesData.total * 150;
      const estimacionNeto = Math.round(estimacionBruto * 0.85); // Descontar 15% aprox

      return {
        bruto: estimacionBruto,
        neto: estimacionNeto,
        jornales: jornalesData.total,
        quincena: jornalesData.quincena
      };

    } catch (error) {
      console.error('❌ Error obteniendo salario:', error);
      return null;
    }
  }

  /**
   * Obtiene la contratación de hoy
   */
  async getContratacionHoy() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      const hoy = this.formatDateToISO(new Date());

      // Obtener jornales de hoy
      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        hoy,
        hoy,
        null
      );

      if (!jornales || jornales.length === 0) {
        return null;
      }

      // Devolver el primer jornal (más reciente)
      const jornal = jornales[0];

      return {
        empresa: jornal.empresa || 'No especificada',
        puesto: jornal.puesto || 'No especificado',
        jornada: jornal.jornada || 'No especificada',
        buque: jornal.buque || 'No especificado',
        parte: jornal.parte || '1'
      };

    } catch (error) {
      console.error('❌ Error obteniendo contratación:', error);
      return null;
    }
  }

  /**
   * Obtiene las puertas del día
   */
  async getPuertas() {
    try {
      const puertasData = await window.SheetsAPI.getPuertas();

      if (!puertasData || !puertasData.puertas) {
        return null;
      }

      return puertasData.puertas.map(p => ({
        jornada: p.jornada,
        sp: p.puertaSP || '-',
        oc: p.puertaOC || '-'
      }));

    } catch (error) {
      console.error('❌ Error obteniendo puertas:', error);
      return null;
    }
  }

  /**
   * Obtiene el nombre del usuario
   */
  async getNombreUsuario() {
    try {
      if (!this.currentChapa) {
        return 'trabajador';
      }

      const nombre = await window.SheetsAPI.getNombrePorChapa(this.currentChapa);
      return nombre || `Chapa ${this.currentChapa}`;

    } catch (error) {
      console.error('❌ Error obteniendo nombre:', error);
      return 'trabajador';
    }
  }

  /**
   * Utilidades
   */
  formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateToSpanish(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

// Exportar
window.PWADataBridge = PWADataBridge;

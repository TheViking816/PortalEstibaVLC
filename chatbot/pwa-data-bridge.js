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

    // Si no hay chapa en localStorage, pedir al usuario que la introduzca
    if (!this.currentChapa) {
      console.warn('⚠️ No hay usuario logueado');

      // Mostrar prompt para introducir chapa manualmente
      const chapa = prompt('Introduce tu número de chapa para usar el asistente:');

      if (chapa) {
        this.currentChapa = chapa.trim();
        localStorage.setItem('currentChapa', this.currentChapa);
        console.log('✅ Chapa guardada:', this.currentChapa);
      } else {
        return false;
      }
    }

    console.log('✅ PWA Data Bridge inicializado para chapa:', this.currentChapa);
    return true;
  }

  /**
   * Cambia la chapa del usuario (para testing)
   */
  cambiarChapa(nuevaChapa) {
    this.currentChapa = nuevaChapa.toString().trim();
    localStorage.setItem('currentChapa', this.currentChapa);
    console.log('✅ Chapa cambiada a:', this.currentChapa);

    // Recargar la página para aplicar cambios
    location.reload();
  }

  /**
   * Obtiene la posición del usuario en el censo
   */
  async getPosicionUsuario() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Verificar que SheetsAPI está disponible
      if (!window.SheetsAPI || typeof window.SheetsAPI.getPosicionChapa !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      console.log('📍 Obteniendo posición para chapa:', this.currentChapa);

      const posicion = await window.SheetsAPI.getPosicionChapa(this.currentChapa);
      const posicionesHasta = await window.SheetsAPI.getPosicionesHastaContratacion(this.currentChapa);

      console.log('✅ Posición obtenida:', { posicion, posicionesHasta });

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

      // Verificar que SheetsAPI está disponible
      if (!window.SheetsAPI || typeof window.SheetsAPI.getJornales !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      // Calcular rango de fechas de la quincena actual
      const hoy = new Date();
      console.log('🕐 Fecha actual del sistema:', hoy.toISOString(), 'Año:', hoy.getFullYear());
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

      console.log('📅 Obteniendo jornales:', { chapa: this.currentChapa, desde: fechaInicioISO, hasta: fechaFinISO });

      // Obtener jornales
      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        fechaInicioISO,
        fechaFinISO,
        null
      );

      console.log('✅ Jornales obtenidos:', jornales.length);

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

      // Verificar que SheetsAPI está disponible
      if (!window.SheetsAPI || typeof window.SheetsAPI.getJornales !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      const hoy = this.formatDateToISO(new Date());

      console.log('🚢 Obteniendo contratación de hoy:', hoy);

      // Obtener jornales de hoy
      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        hoy,
        hoy,
        null
      );

      console.log('✅ Jornales de hoy:', jornales?.length || 0);

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
   * Obtiene todos los jornales del año actual
   */
  async getJornalesAnuales() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      if (!window.SheetsAPI || typeof window.SheetsAPI.getJornales !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      const hoy = new Date();
      const añoActual = hoy.getFullYear();

      const fechaInicio = new Date(añoActual, 0, 1); // 1 de enero
      const fechaFin = hoy; // Hasta hoy

      const fechaInicioISO = this.formatDateToISO(fechaInicio);
      const fechaFinISO = this.formatDateToISO(fechaFin);

      console.log('📅 Obteniendo jornales anuales:', { chapa: this.currentChapa, desde: fechaInicioISO, hasta: fechaFinISO });

      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        fechaInicioISO,
        fechaFinISO,
        null
      );

      console.log('✅ Jornales anuales obtenidos:', jornales.length);

      return jornales;

    } catch (error) {
      console.error('❌ Error obteniendo jornales anuales:', error);
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

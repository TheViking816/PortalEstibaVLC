/**
 * Portal Estiba VLC - Aplicación Principal
 * Gestiona la navegación, autenticación y lógica de la aplicación
 */

// Estado global de la aplicación
const AppState = {
  currentUser: null,
  currentPage: 'login',
  isAuthenticated: false
};

// Datos estáticos - Enlaces actualizados con URLs reales
const ENLACES_DATA = [
  // Formularios
  { titulo: 'Punto y HS', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeGKl5gwKrcj110D_6xhHVo0bn7Fo56tneof68dRyS6xUrD7Q/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Cambio Posición', url: 'https://docs.google.com/forms/d/e/1FAIpQLSe6V16kccSmyBAYCkDNphYAbD7dqe4ydHbVWu_zpXvnFFFxlA/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Cambio IRPF', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfDe2o5X_Bge14GA-bSBPRL7zpB2ZW_isBGGVFGAyvGkSAomQ/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Justificantes', url: 'https://docs.google.com/forms/d/e/1FAIpQLSc27Doc2847bvoPTygEKscwl9jdMuavlCOgtzNDXYVnjSLsUQ/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Comunicar Incidencia', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdc_NZM-gasxCpPZ3z09HgKcEcIapDsgDhNi_9Y45a-jpJnMw/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Modelo 145', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdEumqz7aiATukMmIyO2euqhVW5HEqf5Tn5WetAH5LBabcprg/viewform', categoria: 'Formularios', color: 'blue' },

  // Disponibilidad
  { titulo: 'No Disponible Jornada', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfXcs0lOG7beU9HMfum-6eKkwmZCjcvnOQXaFiiY8EAb9rpYA/closedform', categoria: 'Disponibilidad', color: 'yellow' },
  { titulo: 'No Disponible Periodo', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfTqZSFoEbs89vxmGXVi5DKpKIyH5npIOpI11uiQnt32Rxp3g/closedform', categoria: 'Disponibilidad', color: 'yellow' },
  { titulo: 'Recuperación', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeEaBKptVkoX4oxktWkl5Be7fOhjdYUiRupyFkrG3LxWKISMA/viewform', categoria: 'Disponibilidad', color: 'yellow' },

  // Documentos
  { titulo: 'Carnet de Conducir', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdKF0jRJjcFrdbL3Wk_U-0Cjb3T-JeVYDNuN8QU1a-60kAXqA/viewform', categoria: 'Documentos', color: 'orange' },
  { titulo: 'Doc. Desempleo', url: 'https://docs.google.com/forms/d/e/1FAIpQLScL1GRtLuuRGgOolBLe31cWKqY92DZ9mFzfN2_uJwx3XmRq3g/viewform', categoria: 'Documentos', color: 'orange' },
  { titulo: '145 Abreviado', url: 'https://drive.google.com/file/d/1AwHoBJHTumN-cEYk6jV0nZGBGVFSJWPj/view', categoria: 'Documentos', color: 'orange' },

  // Seguridad
  { titulo: '¿Qué hago en caso de accidente?', url: 'https://drive.google.com/file/d/1Jei371j-lI95VTkBzm2XVfOxofjxvzbh/view', categoria: 'Seguridad', color: 'red' },

  // Información
  { titulo: 'Censo Actualizado', url: 'https://drive.google.com/file/d/1yIqMMJCRTyS8GZglMLTnR01A4MLU-spf/view', categoria: 'Información', color: 'green' },
  { titulo: 'Calendario de Pago', url: 'https://drive.google.com/file/d/1bovGdc1Fb6VRHrru1DrJOsSjbSEhFZgN/view', categoria: 'Información', color: 'green' },
  { titulo: 'Teléfonos Terminales', url: 'https://drive.google.com/file/d/1KxLm_X_0JdUEJF7JUuIvNNleU-PTqUgv/view', categoria: 'Información', color: 'green' },
  { titulo: 'Tabla Contratación', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pubhtml?gid=1388412839&single=true', categoria: 'Información', color: 'green' },
  { titulo: 'Chapero', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pubhtml?gid=841547354&single=true', categoria: 'Información', color: 'green' },

  // Comunicaciones
  { titulo: 'Comunicación Contingencia', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdxLm9xqP4FOv61h3-YoyRFzkxKcfAGir_YYRi5e4PTFisEAw/viewform', categoria: 'Comunicaciones', color: 'purple' },
  { titulo: 'Comunicaciones Oficina', url: 'https://docs.google.com/forms/d/e/1FAIpQLSc_wN20zG_88wmAAyXRsCxokTpfvxRKdILHr5BxrQUuNGqvyQ/closedform', categoria: 'Comunicaciones', color: 'purple' }
];

// Noticias y avisos - Añadir contenido real aquí
const NOTICIAS_DATA = [];

/**
 * Inicialización de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portal Estiba VLC - Iniciando aplicación...');

  initializeApp();
  setupEventListeners();
  checkStoredSession();
});

/**
 * Inicializa la aplicación
 */
function initializeApp() {
  // Cargar contenido estático
  renderEnlaces();
  renderNoticias();

  // Verificar si hay sesión guardada
  const storedChapa = localStorage.getItem('currentChapa');
  if (storedChapa) {
    loginUser(storedChapa);
  } else {
    showPage('login');
  }
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
  // Botón de login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  // Enter en el input de chapa
  const chapaInput = document.getElementById('chapa-input');
  if (chapaInput) {
    chapaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }

  // Botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Navegación del sidebar
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const page = link.dataset.page;
      if (page) {
        navigateTo(page);
        closeSidebar();
      }
    });
  });

  // Cards del dashboard
  const dashboardCards = document.querySelectorAll('.dashboard-card[data-navigate]');
  dashboardCards.forEach(card => {
    card.addEventListener('click', () => {
      const page = card.dataset.navigate;
      if (page) {
        navigateTo(page);
      }
    });
  });

  // Menú móvil
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleSidebar);
  }

  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Foro
  const foroSendBtn = document.getElementById('foro-send');
  if (foroSendBtn) {
    foroSendBtn.addEventListener('click', sendForoMessage);
  }

  const foroInput = document.getElementById('foro-input');
  if (foroInput) {
    foroInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendForoMessage();
      }
    });
  }
}

/**
 * Verifica si hay una sesión guardada
 */
function checkStoredSession() {
  const storedChapa = localStorage.getItem('currentChapa');
  if (storedChapa) {
    AppState.currentUser = storedChapa;
    AppState.isAuthenticated = true;
    updateUIForAuthenticatedUser();
  }
}

/**
 * Maneja el login
 */
function handleLogin() {
  const chapaInput = document.getElementById('chapa-input');
  const errorMsg = document.getElementById('login-error');
  const chapa = chapaInput.value.trim();

  // Validar
  if (!chapa || chapa.length < 2) {
    errorMsg.classList.add('active');
    chapaInput.focus();
    return;
  }

  errorMsg.classList.remove('active');
  loginUser(chapa);
}

/**
 * Inicia sesión de usuario
 */
function loginUser(chapa) {
  AppState.currentUser = chapa;
  AppState.isAuthenticated = true;

  // Guardar en localStorage
  localStorage.setItem('currentChapa', chapa);

  // Actualizar UI
  updateUIForAuthenticatedUser();

  // Navegar al dashboard
  navigateTo('dashboard');
}

/**
 * Actualiza la UI para usuario autenticado
 */
function updateUIForAuthenticatedUser() {
  const userInfo = document.getElementById('user-info');
  const userChapa = document.getElementById('user-chapa');

  if (userInfo) userInfo.classList.remove('hidden');
  if (userChapa) userChapa.textContent = `Chapa ${AppState.currentUser}`;

  // Actualizar mensaje de bienvenida
  const welcomeMsg = document.getElementById('welcome-message');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Bienvenido, Chapa ${AppState.currentUser}`;
  }
}

/**
 * Maneja el logout
 */
function handleLogout() {
  AppState.currentUser = null;
  AppState.isAuthenticated = false;

  localStorage.removeItem('currentChapa');

  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');

  showPage('login');
}

/**
 * Navega a una página
 */
function navigateTo(pageName) {
  if (!AppState.isAuthenticated && pageName !== 'login') {
    showPage('login');
    return;
  }

  AppState.currentPage = pageName;
  showPage(pageName);

  // Cargar datos según la página
  switch (pageName) {
    case 'contratacion':
      loadContratacion();
      break;
    case 'jornales':
      loadJornales();
      break;
    case 'puertas':
      loadPuertas();
      break;
    case 'censo':
      loadCenso();
      break;
    case 'foro':
      loadForo();
      break;
  }
}

/**
 * Muestra una página
 */
function showPage(pageName) {
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => page.classList.remove('active'));

  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Actualizar navegación activa
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Scroll al inicio
  window.scrollTo(0, 0);
}

/**
 * Toggle sidebar en móvil
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

/**
 * Cierra el sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

/**
 * Carga la página de contratación
 */
async function loadContratacion() {
  const container = document.getElementById('contratacion-content');
  const loading = document.getElementById('contratacion-loading');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const allData = await SheetsAPI.getContrataciones(AppState.currentUser);

    // Solo mostrar la contratación ACTUAL (la más reciente)
    // Ordenar por fecha descendente y tomar solo las del día más reciente
    const sortedData = allData.sort((a, b) => {
      const dateA = new Date(a.fecha.split('/').reverse().join('-'));
      const dateB = new Date(b.fecha.split('/').reverse().join('-'));
      return dateB - dateA;
    });

    // Tomar solo las contrataciones de la fecha más reciente
    const data = sortedData.length > 0
      ? sortedData.filter(item => item.fecha === sortedData[0].fecha)
      : [];

    // Guardar TODAS las contrataciones en el histórico de jornales
    // Esto se usará en la pestaña "Mis Jornales"
    if (allData.length > 0) {
      const historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');

      // Agregar solo las nuevas (evitar duplicados)
      allData.forEach(nueva => {
        const existe = historico.some(h =>
          h.fecha === nueva.fecha &&
          h.jornada === nueva.jornada &&
          h.puesto === nueva.puesto
        );
        if (!existe) {
          historico.push(nueva);
        }
      });

      localStorage.setItem('jornales_historico', JSON.stringify(historico));
    }

    loading.classList.add('hidden');

    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No hay asignaciones hoy</h3>
          <p>Actualmente no tienes contrataciones asignadas para el día de hoy.</p>
        </div>
      `;
      return;
    }

    // Mostrar la fecha de la contratación actual
    const fechaInfo = document.createElement('div');
    fechaInfo.style.marginBottom = '1rem';
    fechaInfo.style.padding = '0.75rem';
    fechaInfo.style.background = 'var(--puerto-blue)';
    fechaInfo.style.color = 'white';
    fechaInfo.style.borderRadius = '8px';
    fechaInfo.innerHTML = `<strong>Contratación actual del ${data[0].fecha}</strong>`;
    container.appendChild(fechaInfo);

    // Renderizar tabla con TODOS los campos
    const table = document.createElement('div');
    table.className = 'data-table';
    table.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Puesto</th>
            <th>Jornada</th>
            <th>Empresa</th>
            <th>Buque</th>
            <th>Parte</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.fecha}</td>
              <td><strong>${row.puesto}</strong></td>
              <td>${row.jornada}</td>
              <td>${row.empresa}</td>
              <td>${row.buque}</td>
              <td>${row.parte}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.appendChild(table);

  } catch (error) {
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las asignaciones. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Carga la página de jornales
 */
/**
 * Carga la página de jornales - NUEVA LÓGICA
 * Muestra TODOS los jornales individuales: Fecha, Parte, Puesto, Empresa, Buque
 */
async function loadJornales() {
  const statsContainer = document.getElementById('jornales-stats');
  const container = document.getElementById('jornales-content');
  const loading = document.getElementById('jornales-loading');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';
  statsContainer.innerHTML = '';

  try {
    // Obtener el histórico almacenado en localStorage
    // Este se va actualizando cada vez que se carga "Mi Contratación"
    const historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');

    // Filtrar solo los del usuario actual
    const data = historico.filter(item => item.chapa === AppState.currentUser);

    // Ordenar por fecha descendente (más recientes primero)
    data.sort((a, b) => {
      const dateA = new Date(a.fecha.split('/').reverse().join('-'));
      const dateB = new Date(b.fecha.split('/').reverse().join('-'));
      return dateB - dateA;
    });

    loading.classList.add('hidden');

    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No hay datos de jornales</h3>
          <p>No se encontraron registros de jornales para tu chapa en la quincena actual.</p>
        </div>
      `;
      return;
    }

    // Calcular estadísticas simples
    const totalJornales = data.length;

    // Renderizar stats
    statsContainer.innerHTML = `
      <div class="stat-card blue">
        <div class="stat-label">Total Jornales Registrados</div>
        <div class="stat-value">${totalJornales}</div>
      </div>
    `;

    // Renderizar tabla con TODOS los jornales individuales
    const table = document.createElement('div');
    table.className = 'data-table';
    table.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Puesto</th>
            <th>Jornada</th>
            <th>Empresa</th>
            <th>Buque</th>
            <th>Parte</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td><strong>${row.fecha}</strong></td>
              <td>${row.puesto}</td>
              <td>${row.jornada}</td>
              <td>${row.empresa}</td>
              <td>${row.buque}</td>
              <td>${row.parte}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.appendChild(table);

  } catch (error) {
    loading.classList.add('hidden');
    statsContainer.innerHTML = '';
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar los jornales. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Carga la página de puertas
 * Muestra la fecha actual del sistema en el título
 */
async function loadPuertas() {
  const container = document.getElementById('puertas-content');
  const loading = document.getElementById('puertas-loading');
  const tituloElement = document.getElementById('puertas-titulo');
  const fechaElement = document.getElementById('puertas-fecha');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const result = await SheetsAPI.getPuertas();
    const fecha = result.fecha || new Date().toLocaleDateString('es-ES');
    const data = result.puertas || [];

    loading.classList.add('hidden');

    // Actualizar título con la fecha del CSV
    if (tituloElement) {
      tituloElement.textContent = `Puertas del Día`;
    }
    if (fechaElement) {
      fechaElement.textContent = `Información para el ${fecha}`;
    }

    // Separar puertas laborables y festivas
    const puertasLaborables = data.filter(item =>
      item.jornada && !item.jornada.toLowerCase().includes('festivo')
    );
    const puertasFestivas = data.filter(item =>
      item.jornada && item.jornada.toLowerCase().includes('festivo')
    );

    // Crear sección de puertas laborables
    if (puertasLaborables.length > 0) {
      const laborablesTitle = document.createElement('h3');
      laborablesTitle.className = 'puertas-section-title';
      laborablesTitle.textContent = 'Puertas Laborables';
      container.appendChild(laborablesTitle);

      const laborablesGrid = document.createElement('div');
      laborablesGrid.className = 'puertas-grid';

      puertasLaborables.forEach(item => {
        const puerta = item.puertaSP || item.puertaOC || '';
        const isEmpty = !puerta || puerta.trim() === '';

        const card = document.createElement('div');
        card.className = `puerta-card ${isEmpty ? 'empty' : 'assigned'}`;
        card.innerHTML = `
          <div class="puerta-jornada">${item.jornada}</div>
          <div class="puerta-numero">${isEmpty ? '—' : puerta}</div>
          ${isEmpty ? '<div class="puerta-status" style="color: var(--puerto-red);">No contratada</div>' : '<div class="puerta-status" style="color: var(--puerto-green);">Asignada</div>'}
        `;
        laborablesGrid.appendChild(card);
      });

      container.appendChild(laborablesGrid);
    }

    // Crear sección de puertas festivas
    if (puertasFestivas.length > 0) {
      const festivasTitle = document.createElement('h3');
      festivasTitle.className = 'puertas-section-title';
      festivasTitle.textContent = 'Puertas Festivas';
      festivasTitle.style.marginTop = '2rem';
      container.appendChild(festivasTitle);

      const festivasGrid = document.createElement('div');
      festivasGrid.className = 'puertas-grid';

      puertasFestivas.forEach(item => {
        const puerta = item.puertaSP || item.puertaOC || '';
        const isEmpty = !puerta || puerta.trim() === '';

        const card = document.createElement('div');
        card.className = `puerta-card festiva ${isEmpty ? 'empty' : 'assigned'}`;
        card.innerHTML = `
          <div class="puerta-jornada">${item.jornada}</div>
          <div class="puerta-numero">${isEmpty ? '—' : puerta}</div>
          ${isEmpty ? '<div class="puerta-status" style="color: var(--puerto-red);">No contratada</div>' : '<div class="puerta-status" style="color: var(--puerto-green);">Asignada</div>'}
        `;
        festivasGrid.appendChild(card);
      });

      container.appendChild(festivasGrid);
    }

  } catch (error) {
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las puertas. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Carga la página de censo
 */
async function loadCenso() {
  const container = document.getElementById('censo-content');
  const loading = document.getElementById('censo-loading');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const data = await SheetsAPI.getCenso();

    loading.classList.add('hidden');

    data.forEach(item => {
      const div = document.createElement('div');
      div.className = `censo-item ${item.color}`;
      div.textContent = item.chapa;
      div.title = `Chapa ${item.chapa}`;
      container.appendChild(div);
    });

  } catch (error) {
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudo cargar el censo. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Renderiza los enlaces
 */
function renderEnlaces() {
  const container = document.getElementById('enlaces-content');
  if (!container) return;

  const categorias = [...new Set(ENLACES_DATA.map(e => e.categoria))];

  categorias.forEach(categoria => {
    const section = document.createElement('div');
    section.className = 'enlaces-section';

    const title = document.createElement('h3');
    title.textContent = categoria;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'enlaces-grid';

    const enlaces = ENLACES_DATA.filter(e => e.categoria === categoria);
    enlaces.forEach(enlace => {
      const a = document.createElement('a');
      a.href = enlace.url;
      a.className = `enlace-btn ${enlace.color}`;
      a.textContent = enlace.titulo;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      grid.appendChild(a);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/**
 * Renderiza las noticias
 */
function renderNoticias() {
  const container = document.getElementById('noticias-content');
  if (!container) return;

  NOTICIAS_DATA.forEach(noticia => {
    const card = document.createElement('div');
    card.className = 'noticia-card';
    card.innerHTML = `
      <div class="noticia-header">
        <div class="noticia-titulo">${noticia.titulo || noticia.titular}</div>
        <div class="noticia-fecha">${noticia.fecha}</div>
      </div>
      <div class="noticia-contenido">${noticia.contenido}</div>
    `;
    container.appendChild(card);
  });
}

/**
 * Carga el foro
 */
function loadForo() {
  const messages = getForoMessages();
  renderForoMessages(messages);
}

/**
 * Obtiene mensajes del foro desde localStorage
 */
/**
 * Obtiene mensajes del foro desde localStorage
 */
function getForoMessages() {
  const stored = localStorage.getItem('foro_messages');
  if (stored) {
    return JSON.parse(stored);
  }

  // Sin mensajes iniciales - foro vacío
  const initialMessages = [];

  localStorage.setItem('foro_messages', JSON.stringify(initialMessages));
  return initialMessages;
}

/**
 * Renderiza mensajes del foro
 */
function renderForoMessages(messages) {
  const container = document.getElementById('foro-messages');
  if (!container) return;

  container.innerHTML = '';

  // Ordenar por timestamp (más ANTIGUOS primero, recientes abajo)
  const sorted = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  sorted.forEach(msg => {
    const isOwn = msg.chapa === AppState.currentUser;
    const timeAgo = getTimeAgo(new Date(msg.timestamp));

    const messageDiv = document.createElement('div');
    messageDiv.className = `foro-message ${isOwn ? 'own' : ''}`;
    messageDiv.innerHTML = `
      <div class="foro-message-content">
        <div class="foro-message-header">
          <span class="foro-message-chapa">Chapa ${msg.chapa}</span>
          <span class="foro-message-time">${timeAgo}</span>
        </div>
        <div class="foro-message-text">${escapeHtml(msg.texto)}</div>
      </div>
    `;

    container.appendChild(messageDiv);
  });
}

/**
 * Envía un mensaje al foro
 */
function sendForoMessage() {
  const input = document.getElementById('foro-input');
  if (!input) return;

  const texto = input.value.trim();
  if (!texto) return;

  const messages = getForoMessages();

  const newMessage = {
    id: Date.now(),
    chapa: AppState.currentUser,
    timestamp: new Date().toISOString(),
    texto: texto
  };

  messages.push(newMessage);
  localStorage.setItem('foro_messages', JSON.stringify(messages));

  input.value = '';
  renderForoMessages(messages);

  // Scroll al final para ver el nuevo mensaje (más reciente abajo)
  const container = document.getElementById('foro-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

/**
 * Calcula el tiempo transcurrido
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return 'Ahora mismo';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

  return date.toLocaleDateString('es-ES');
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exponer funciones globalmente si es necesario
window.AppState = AppState;
window.navigateTo = navigateTo;

# Portal Estiba VLC

Portal web centralizado para estibadores eventuales del Puerto de Valencia. Proporciona acceso a información en tiempo real sobre asignaciones, jornales, puertas y comunicación entre compañeros.

## 🚢 Características

- **Sistema de Login por Chapa**: Acceso personalizado para cada estibador
- **Dashboard Intuitivo**: Vista general con acceso rápido a todas las secciones
- **Mi Contratación**: Consulta tus asignaciones del día en tiempo real
- **Mis Jornales**: Seguimiento detallado de jornales por quincena con estadísticas
- **Puertas**: Información actualizada de puertas por jornada
- **Censo**: Visualización del censo de disponibilidad
- **Enlaces Útiles**: Acceso rápido a formularios y recursos
- **Noticias y Avisos**: Comunicaciones importantes del puerto
- **Foro de Compañeros**: Sistema de mensajería para comunicarse con otros estibadores

## 🎨 Diseño

- Interfaz moderna y atractiva con gradientes y efectos visuales
- Totalmente responsive (móvil, tablet y escritorio)
- Imágenes temáticas del Puerto de Valencia
- Paleta de colores inspirada en el entorno portuario
- Animaciones suaves y transiciones fluidas

## 🔧 Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos personalizados con variables CSS y gradientes
- **JavaScript (ES6+)**: Lógica de aplicación
- **TailwindCSS**: Utilidades CSS adicionales
- **Google Sheets API**: Integración con hojas de cálculo para datos en tiempo real
- **LocalStorage**: Persistencia de sesión y datos del foro

## 📁 Estructura del Proyecto

```
PortalEstibaVLC/
├── index.html          # Página principal con toda la estructura HTML
├── styles.css          # Estilos personalizados de la aplicación
├── app.js              # Lógica principal de la aplicación
├── sheets.js           # Módulo de integración con Google Sheets
└── README.md           # Este archivo
```

## 🚀 Instalación y Uso

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/RentaDGI/PortalEstibaVLC.git
   cd PortalEstibaVLC
   ```

2. **Abre el archivo `index.html` en tu navegador**:
   - Puedes abrirlo directamente haciendo doble clic
   - O usar un servidor local (recomendado):
     ```bash
     # Con Python 3
     python -m http.server 8000

     # Con Node.js (http-server)
     npx http-server
     ```

3. **Accede al portal**:
   - Abre `http://localhost:8000` en tu navegador
   - Introduce tu número de chapa para acceder

## 📊 Configuración de Google Sheets

El portal está configurado para obtener datos de Google Sheets públicas. Las URLs están configuradas en `sheets.js`:

- **Puertas**: GID `1650839211`
- **Asignaciones**: GID `1304645770`
- **Censo**: GID `0` (ajustar según necesidad)
- **Jornales**: GID `0` (ajustar según necesidad)

### Formato esperado de las hojas:

**Puertas**:
| Jornada | Puerta |
|---------|--------|
| 02-08   | 153    |
| 08-14   | 72     |

**Asignaciones**:
| Fecha | Chapa | Puesto | Jornada | Empresa | Buque |
|-------|-------|--------|---------|---------|-------|
| 31/10/2025 | 221 | Conductor de 1ª | 20-02 | APM | ODYSSEUS |

**Censo**:
| Chapa | Color/Estado |
|-------|--------------|
| 221   | green        |
| 330   | red          |

**Jornales**:
| Chapa | Quincena | Jornales | Horas | Nocturnos | Festivos |
|-------|----------|----------|-------|-----------|----------|
| 221   | Oct 1-15 | 7        | 42    | 2         | 1        |

## 🎯 Funcionalidades Principales

### Login
- Acceso mediante número de chapa
- Sesión persistente (se mantiene al recargar)
- Logout seguro

### Dashboard
- Tarjetas de acceso rápido a todas las secciones
- Mensaje de bienvenida personalizado
- Imágenes temáticas del puerto

### Mi Contratación
- Filtra automáticamente las asignaciones por chapa
- Muestra fecha, puesto, jornada, empresa y buque
- Indicador visual cuando no hay asignaciones

### Mis Jornales
- Estadísticas totales (jornales, horas, nocturnos)
- Desglose por quincena
- Barras de progreso visuales
- Cálculo automático de totales

### Puertas
- Vista en grid de todas las jornadas
- Indicador visual de puertas asignadas/vacías
- Actualización automática desde Google Sheets

### Censo
- Grid visual de chapas con código de colores
- Verde: Disponible
- Rojo: No disponible
- Amarillo: Pendiente
- Naranja: Otros estados

### Foro
- Sistema de mensajería en tiempo real
- Persistencia en localStorage
- Mensajes propios destacados visualmente
- Timestamp relativo (hace X minutos)

## 🔄 Cache y Actualización de Datos

- Los datos de Google Sheets se cachean durante 5 minutos
- Para forzar actualización, abre la consola y ejecuta:
  ```javascript
  clearSheetsCache()
  ```
- El cache se actualiza automáticamente después del tiempo configurado

## 🎨 Personalización

### Colores
Edita las variables CSS en `styles.css`:
```css
:root {
  --puerto-blue: #0a2e5c;
  --puerto-teal: #14b8a6;
  --puerto-orange: #f97316;
  /* ... más colores */
}
```

### Enlaces
Modifica el array `ENLACES_DATA` en `app.js` para añadir o cambiar enlaces.

### Noticias
Modifica el array `NOTICIAS_DATA` en `app.js` para gestionar noticias.

## 📱 Responsive Design

- **Escritorio**: Sidebar fijo, todas las funcionalidades visibles
- **Tablet**: Layout adaptativo
- **Móvil**: Sidebar off-canvas, navegación optimizada

## 🔒 Seguridad

- Escape de HTML en mensajes del foro (prevención XSS)
- Validación de entrada de chapa
- Uso de localStorage para datos no sensibles

## 🐛 Solución de Problemas

### Los datos no cargan
- Verifica que las URLs de Google Sheets sean correctas
- Asegúrate de que las hojas sean públicas
- Revisa la consola del navegador para errores

### El foro no muestra mensajes
- Limpia el localStorage: `localStorage.clear()`
- Recarga la página

### La sesión no persiste
- Verifica que las cookies/localStorage estén habilitadas
- Prueba en modo incógnito para descartar extensiones

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autor

Desarrollado para los estibadores eventuales del Puerto de Valencia.

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, abre un issue en GitHub.

---

**Puerto de Valencia - Portal de Estibadores Eventuales**

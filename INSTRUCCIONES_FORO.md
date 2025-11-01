# Configuración del Foro Compartido

El foro actualmente usa `localStorage` que es local al navegador. Para que los mensajes se compartan entre dispositivos y usuarios, necesitas configurar Google Apps Script.

## Paso 1: Crear pestaña "foro" en tu Google Sheet

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc
2. Crea una nueva pestaña llamada **"foro"**
3. Estructura de la pestaña:
   - **Columna A**: Timestamp (ejemplo: 2025-01-11T10:30:00.000Z)
   - **Columna B**: Chapa (ejemplo: 703)
   - **Columna C**: Texto (el mensaje)
4. La primera fila debe tener headers: `Timestamp`, `Chapa`, `Texto`

## Paso 2: Publicar la pestaña del foro como CSV

1. En tu Google Sheet, ve a **Archivo → Compartir → Publicar en la web**
2. En "Vínculo", selecciona la pestaña **"foro"**
3. Cambia el formato a **Valores separados por comas (.csv)**
4. Haz clic en **Publicar**
5. Copia la URL generada (debería verse como: `https://docs.google.com/spreadsheets/d/e/2PACX-xxx/pub?gid=XXXX&single=true&output=csv`)
6. Anota el **gid** (número después de `gid=`)

## Paso 3: Actualizar sheets.js con el GID del foro

Abre `sheets.js` y reemplaza `FORO_GID` en la línea 494 con el gid de tu pestaña del foro:

```javascript
const foroURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcJ5Irxl93zwDqehuLW7-MsuVtphRDtmF8Rwp-yueqcAYRfgrTtEdKDwX8WKkJj1m0rVJc8AncGN_A/pub?gid=123456789&single=true&output=csv';
//                                                                                                                                                                      ^^^^^^^^^ reemplaza con tu GID
```

## Paso 4: Crear Google Apps Script Web App

1. Abre tu Google Sheet
2. Ve a **Extensiones → Apps Script**
3. Borra todo el código que aparece
4. Pega el siguiente código:

```javascript
/**
 * Google Apps Script para Portal Estiba VLC - Foro
 * Este script permite a la web escribir mensajes en el foro
 */

// Configuración
const SHEET_NAME = 'foro'; // Nombre de la pestaña del foro

/**
 * Función que maneja las peticiones POST desde la web
 */
function doPost(e) {
  try {
    // Parsear el cuerpo JSON
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'addMessage') {
      // Agregar mensaje al sheet
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Pestaña "foro" no encontrada'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // Agregar nueva fila con el mensaje
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.chapa || '',
        data.texto || ''
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Mensaje agregado correctamente'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Acción no reconocida'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función que maneja las peticiones GET (para testing)
 */
function doGet(e) {
  return ContentService.createTextOutput('Portal Estiba VLC - Foro API está funcionando')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

5. Guarda el proyecto con el nombre "Portal Estiba Foro API"
6. Haz clic en **Implementar → Nueva implementación**
7. En "Tipo", selecciona **Aplicación web**
8. Configuración:
   - **Ejecutar como**: Yo (tu cuenta)
   - **Quién tiene acceso**: Cualquier persona
9. Haz clic en **Implementar**
10. **IMPORTANTE**: Copia la URL del Web App que aparece (debería verse como: `https://script.google.com/macros/s/AKfycbxxxxx/exec`)

## Paso 5: Configurar la URL del Apps Script en el portal

1. Abre el Portal Estiba VLC en tu navegador
2. Abre la consola del navegador (F12 → Console)
3. Ejecuta este comando (reemplaza la URL con la tuya):

```javascript
localStorage.setItem('foro_apps_script_url', 'https://script.google.com/macros/s/TU_URL_AQUI/exec');
```

4. Recarga la página

## ¡Listo!

Ahora el foro está configurado para compartirse entre todos los dispositivos y usuarios. Los mensajes se guardan en el Google Sheet y todos pueden verlos.

### Solución de problemas

**No aparecen los mensajes nuevos:**
- Verifica que la pestaña "foro" exista y esté publicada
- Verifica que el GID en sheets.js sea correcto
- Abre la consola del navegador y busca errores

**No se pueden enviar mensajes:**
- Verifica que la URL del Apps Script esté configurada correctamente
- Verifica que el Apps Script esté implementado con acceso "Cualquier persona"
- Puede tardar 1-2 segundos en aparecer el mensaje (se recarga automáticamente)

**Solución temporal (sin Apps Script):**

Si no quieres configurar el Apps Script por ahora:
- Los mensajes se seguirán guardando en localStorage (solo en tu dispositivo)
- Puedes agregar mensajes directamente en el Google Sheet manualmente
- La web los leerá cuando recarges la página del foro

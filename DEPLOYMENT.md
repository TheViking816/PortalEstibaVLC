# Portal Estiba VLC - Guía de Despliegue y Funcionalidades

## ✅ Correcciones Implementadas

### 1. Fecha en Puertas
- **CORREGIDO**: Ahora muestra la fecha del CSV formateada correctamente
- Formato: `3/11/25` → `03/11/2025`
- La fecha se extrae directamente del CSV de puertas

### 2. Censo
- **CORREGIDO**: Filtro para chapas < 50
- Ya no debería aparecer el número "1" (posición)
- Solo muestra chapas válidas (702, 537, 918, etc.)
- Si aún aparece algún número sospechoso, revisa los logs de la consola

### 3. Enlaces
- **IMPLEMENTADOS**: Todos los 29 enlaces con URLs reales
- Organizados en 6 categorías: Formularios, Disponibilidad, Documentos, Seguridad, Información, Comunicaciones

---

## 🔐 Sistema de Login con Contraseña

### Propuesta de Implementación

Te propongo 3 opciones para implementar un sistema de login con contraseña:

### **OPCIÓN 1: Google Sheet con Chapas y Contraseñas (RECOMENDADA)** ⭐

**Ventajas:**
- Fácil de gestionar por administradores
- Puedes cambiar contraseñas sin tocar código
- Centralizado y seguro

**Cómo funciona:**
1. Crear una Google Sheet con columnas: `Chapa | Contraseña | Nombre | Email (opcional)`
2. Ejemplo:
   ```
   702  | pass123  | Juan García    | juan@example.com
   221  | abc456   | María López    | maria@example.com
   537  | xyz789   | Pedro Sánchez  | pedro@example.com
   ```
3. Publicar la sheet como CSV
4. La web valida chapa + contraseña contra el CSV

**Implementación:**
```javascript
// En el login, verificar:
1. Usuario ingresa chapa + contraseña
2. Fetch del CSV de usuarios
3. Buscar chapa en el CSV
4. Comparar contraseña
5. Si coincide → Login exitoso
```

**Seguridad:**
- Las contraseñas estarían en texto plano en la sheet (solo admin puede ver)
- Para mayor seguridad, usar contraseñas hasheadas (más complejo)

---

### **OPCIÓN 2: Sistema de PIN de 4 dígitos (MÁS SIMPLE)** 🔢

**Ventajas:**
- Muy simple de implementar
- Fácil de recordar para usuarios
- No requiere email

**Cómo funciona:**
1. Cada estibador tiene un PIN de 4 dígitos
2. Login: Chapa + PIN
3. Almacenado en Google Sheet: `Chapa | PIN`

Ejemplo:
```
702  | 1234
221  | 5678
537  | 9012
```

---

### **OPCIÓN 3: Email + Código de Verificación (MÁS SEGURO)** 📧

**Ventajas:**
- Más seguro
- Permite recuperación de contraseña
- Verificación por email

**Cómo funciona:**
1. Usuario ingresa chapa + email
2. Sistema envía código de 6 dígitos al email
3. Usuario ingresa código para verificar
4. Requiere servicio de email (como EmailJS o SendGrid)

**Desventajas:**
- Más complejo de implementar
- Requiere servicio externo de email

---

### **Mi Recomendación: OPCIÓN 1 (Google Sheet)**

Es el balance perfecto entre seguridad, facilidad de gestión y simplicidad de implementación.

**¿Quieres que implemente este sistema? Si sí, dime:**
1. ¿Prefieres contraseñas o PINs de 4 dígitos?
2. ¿Necesitas que los usuarios puedan cambiar su contraseña?
3. ¿Quieres recuperación de contraseña?

---

## 📅 Almacenamiento de Jornales por Quincena

### Estado Actual

Actualmente, los jornales se almacenan en `localStorage` del navegador con estas características:

**Cómo funciona:**
1. Cada vez que cargas "Mi Contratación", se guarda en `localStorage` (key: `jornales_historico`)
2. En "Mis Jornales" se muestran TODOS los registros almacenados
3. Se ordenan por fecha descendente (más recientes primero)
4. **NO se borran automáticamente**

**Limitaciones actuales:**
- localStorage puede almacenar ~5-10 MB (suficiente para años de datos)
- Si el usuario borra caché del navegador, se pierden los datos
- No está organizado por quincenas (solo lista cronológica)

---

### Propuesta de Mejora: Sistema de Quincenas

**Características mejoradas:**
1. **Organizar por quincenas:**
   - Quincena 1: 1-15 de cada mes
   - Quincena 2: 16-último día del mes

2. **Agrupar visualmente:**
   ```
   📅 Noviembre 2025 - Quincena 1 (1-15)
      - Jornales: 8
      - Total horas: 48h
      [Ver detalles ▼]

   📅 Noviembre 2025 - Quincena 2 (16-30)
      - Jornales: 7
      - Total horas: 42h
      [Ver detalles ▼]
   ```

3. **Resumen por quincena:**
   - Total de jornales
   - Total de horas trabajadas
   - Desglose por empresa
   - Desglose por puesto

4. **Retención:**
   - Mantener últimos 12 meses (24 quincenas)
   - Opción de "exportar histórico" a CSV antes de borrar

**¿Quieres que implemente este sistema mejorado?**

---

## 🚀 Cómo Publicar la Web

### Opción 1: GitHub Pages (GRATIS y FÁCIL) ⭐

**Pasos:**

1. **Crear repositorio público en GitHub:**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/portal-estiba-vlc.git
   git branch -M main
   git push -u origin main
   ```

2. **Activar GitHub Pages:**
   - Ve a Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

3. **Tu web estará en:**
   ```
   https://TU_USUARIO.github.io/portal-estiba-vlc/
   ```

**Ventajas:**
- ✅ Totalmente gratis
- ✅ HTTPS automático
- ✅ Actualización automática con cada push
- ✅ Sin límite de tráfico razonable

---

### Opción 2: Netlify (MUY FÁCIL, GRATIS) ⭐⭐

**Pasos:**

1. Ve a [netlify.com](https://www.netlify.com/)
2. Sign up (gratis)
3. "Add new site" → "Import an existing project"
4. Conecta con GitHub
5. Selecciona tu repositorio
6. Deploy!

**Tu web estará en:**
```
https://portal-estiba-vlc.netlify.app
```

**Puedes usar dominio personalizado:**
```
https://estiba.valencia.com (si lo compras)
```

**Ventajas:**
- ✅ Deploy automático con cada push
- ✅ Preview de pull requests
- ✅ Certificado SSL gratis
- ✅ CDN global rápido

---

### Opción 3: Vercel (ALTERNATIVA A NETLIFY)

Similar a Netlify, pero de la empresa detrás de Next.js.

**Pasos:**
1. Ve a [vercel.com](https://vercel.com/)
2. Sign up con GitHub
3. Import repository
4. Deploy!

---

### Opción 4: Servidor Propio / Hosting Compartido

Si tienes un servidor o hosting compartido (cPanel):

1. **Subir archivos por FTP:**
   - index.html
   - app.js
   - sheets.js
   - styles.css

2. **Configurar:**
   - Asegúrate que el servidor sirve archivos estáticos
   - No requiere PHP, Node.js, ni backend

---

## 📋 Recomendación Final para Publicación

**Para empezar rápido:** Usa **GitHub Pages** o **Netlify**

**Ventajas:**
- Gratis
- Fácil de actualizar
- HTTPS incluido
- No requiere mantenimiento

**Pasos siguientes después de publicar:**
1. Compartir URL con compañeros
2. Probar desde diferentes dispositivos
3. Recoger feedback
4. Implementar mejoras

---

## 🎯 Próximos Pasos Sugeridos

1. **Login con contraseña** (prioridad alta si quieres seguridad)
2. **Sistema de quincenas mejorado** (mejor UX para jornales)
3. **Notificaciones push** (avisar de nuevas contrataciones)
4. **Modo offline** (funcione sin internet usando Service Workers)
5. **Exportar jornales a PDF** (para imprimir nóminas)

---

## 🐛 Debugging

Si algo no funciona:

1. **Abre la consola del navegador** (F12)
2. **Busca errores en rojo**
3. **Mira los logs** que dejé para debug:
   - `=== PUERTAS CSV RAW ===`
   - `=== CONTRATACIÓN CSV RAW ===`
   - `=== CENSO CSV RAW ===`

4. **Copia los logs y compártelos** para que pueda ayudarte

---

## 📞 Soporte

¿Necesitas ayuda con:
- Implementación de login
- Publicación de la web
- Mejoras adicionales
- Bugs o errores

¡Dímelo y te ayudo! 🚀

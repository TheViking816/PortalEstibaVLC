# 🤖 Cómo Abrir el Chatbot IA

## ✅ MÉTODO CORRECTO (servidor HTTP):

### 1️⃣ Abre un servidor local

**Opción A - Python (si lo tienes instalado):**
```bash
cd C:\Users\adria\PortalEstibaVLC\Calculadora_prevision\PortalEstibaVLC
python -m http.server 8000
```

**Opción B - Node.js (si tienes npm):**
```bash
cd C:\Users\adria\PortalEstibaVLC\Calculadora_prevision\PortalEstibaVLC
npx http-server -p 8000
```

**Opción C - PHP (si lo tienes):**
```bash
cd C:\Users\adria\PortalEstibaVLC\Calculadora_prevision\PortalEstibaVLC
php -S localhost:8000
```

### 2️⃣ Abre la PWA en el navegador

```
http://localhost:8000
```

### 3️⃣ Inicia sesión con tu chapa

### 4️⃣ Click en "Chatbot IA" en el sidebar

El chatbot se abrirá en una nueva pestaña y compartirá los datos con la PWA.

---

## ❌ NO FUNCIONA:

- ❌ **Doble click en index.html** → Error `file://` CORS
- ❌ **Abrir directamente chatbot/index.html** → No comparte datos

---

## 🔧 Si el Chatbot NO Calcula Sueldo:

Significa que el navegador tiene cache viejo.

**Solución:**
1. En el chatbot, presiona **F12**
2. Ve a **Application** → **Clear Storage**
3. Click **"Clear site data"**
4. Recarga la página (**Ctrl+Shift+R**)

---

## 📊 Qué Debe Hacer el Chatbot:

Cuando preguntes:
- "¿Cuánto cobro?"
- "¿Cuánto llevo ganado?"
- "Mi salario"

Debe responder con:
```
💰 Segunda quincena: llevas 3 jornales

Salario bruto: 425.50€
IRPF (25%): -106.38€
Salario neto: 319.12€

Últimos jornales:
• 18/11 - Especialista (14-20): 141.83€
• 19/11 - Especialista (14-20): 141.83€
• 20/11 - Trincador (08-14): 141.84€
```

---

## 🆘 Si Sigue Sin Funcionar:

1. Verifica que el servidor está corriendo en el puerto correcto
2. Verifica que accedes vía `http://localhost:PUERTO` (no `file://`)
3. Limpia cache completamente
4. Cierra y abre el navegador

---

## 🔄 Últimas Actualizaciones (v=9)

✅ **DETECCIÓN DE INTENCIÓN MEJORADA**: Arreglado problema donde "¿Cuánto llevo ganado este año?" era detectado como consulta de quincena
✅ **CÁLCULO ANUAL FUNCIONANDO**: Ahora calcula correctamente todos los jornales del año completo
✅ **CÁLCULO DE SALARIO CORREGIDO**: Usa la tabla salarial real con valores precisos
✅ **Auth compartida con PWA**: El chatbot lee la autenticación de la PWA automáticamente
✅ **Sistema de tipo de día**: Detecta LABORABLE, SABADO, FESTIVO, FEST-FEST, LAB-FEST correctamente
✅ **Prima calculada**: Calcula la prima según tipo de operativa (Contenedor: 120 mov, Coches: prima fija)
✅ **Logs de debug**: Añadidos logs para ver qué handler se usa (quincena vs año)

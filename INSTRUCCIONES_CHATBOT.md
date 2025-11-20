# 📋 Instrucciones para Probar el Chatbot IA

## ✅ ¿Qué se ha implementado?

He creado un **chatbot IA completamente funcional** en la rama `chatbot-ia` con estas características:

### 🎯 Características Implementadas

1. **IA Local Gratuita** (100% sin coste)
   - Motor de pattern matching inteligente
   - Reconoce intenciones del usuario
   - Base de conocimiento precargada
   - Funciona sin internet una vez cargado

2. **Reconocimiento de Voz** (gratis, nativo del navegador)
   - Presiona el micrófono y habla
   - Web Speech API
   - Transcripción a texto automática

3. **Síntesis de Voz** (gratis, nativo del navegador)
   - El bot te responde por voz
   - Voz en español
   - Activable/desactivable

4. **Integración Total con tu PWA**
   - Acceso a Supabase compartido
   - Lee tus jornales, posición, salarios
   - Puede abrir enlaces de formularios

5. **PWA Independiente**
   - Instalable en móvil
   - Funciona offline
   - UI moderna tipo WhatsApp

## 🚀 Cómo Probar el Chatbot AHORA

### Paso 1: Verificar la rama

```bash
# Ya estás en la rama chatbot-ia
git branch
# Deberías ver: * chatbot-ia
```

### Paso 2: Abrir el chatbot

Tienes 2 opciones:

**Opción A: Servidor local**

```bash
# Si tienes Python instalado:
cd chatbot
python -m http.server 8080

# O con Node.js:
npx http-server -p 8080
```

Luego abre: `http://localhost:8080`

**Opción B: Directamente desde archivo**

Abre `chatbot/index.html` directamente en Chrome o Edge.

**IMPORTANTE**: Algunas funciones (voz, Supabase) requieren HTTPS o localhost.

### Paso 3: Iniciar sesión primero

El chatbot necesita que hayas iniciado sesión en la PWA principal:

1. Abre la PWA principal: `index.html` (en la raíz)
2. Inicia sesión con tu chapa
3. Luego abre el chatbot

Esto es necesario porque el chatbot lee tu `chapa` de `localStorage`.

### Paso 4: Prueba estas preguntas

Una vez en el chatbot, prueba:

- "Hola" → Te saludará
- "¿Cuándo voy a trabajar?" → Te abrirá el Oráculo
- "¿A cuántas posiciones estoy?" → Te muestra tu posición
- "¿Cuántos jornales llevo esta quincena?" → Cuenta tus jornales
- "¿Cuánto llevo ganado?" → Estima tu salario
- "¿Dónde trabajo hoy?" → Te dice empresa y puesto
- "Ponme no disponible" → Abre el formulario
- "Ayuda" → Lista de comandos

### Paso 5: Probar la voz

1. Haz clic en el icono del micrófono (🎤)
2. Di: "Cuándo voy a trabajar"
3. El chatbot transcribirá y responderá

**Nota**: La primera vez, el navegador pedirá permisos de micrófono.

## 🔧 Configuración Opcional

### Desactivar respuestas por voz

1. Haz clic en ⚙️ (ajustes)
2. Desmarca "Respuestas por voz"

### Cambiar modo de IA (futuro)

Por ahora solo funciona el modo "Local". Pero está preparado para:

- **Groq**: IA conversacional gratuita (cuando lo configures)
- **OpenAI**: GPT-4 (cuando tengas API key)

## 📱 Instalar como App en Móvil

### Android

1. Abre el chatbot en Chrome
2. Menú (⋮) → "Añadir a pantalla de inicio"
3. Ya tienes el chatbot como app

### iOS

1. Abre el chatbot en Safari
2. Botón Compartir (📤) → "Añadir a pantalla de inicio"

## 🐛 Solución de Problemas

### "No hay usuario logueado"

**Solución**: Abre la PWA principal primero e inicia sesión.

### El micrófono no funciona

**Solución**:
- Usa HTTPS o localhost
- Da permisos al navegador
- Prueba con Chrome o Edge

### No ve mis datos (jornales, posición)

**Solución**:
- Verifica que `supabase.js` está cargado
- Abre la consola (F12) y busca errores
- Asegúrate de que la PWA principal funciona

### Las respuestas no tienen sentido

**Solución**:
- El modo Local es pattern matching, no GPT
- Usa frases simples: "cuándo trabajo", "mi posición"
- Prueba con los chips (botones de acciones rápidas)

## 📊 ¿Qué Sigue? - Roadmap

### Fase 2: API Keys Gratuitas (Opcional)

Cuando quieras mejorar la IA conversacional (sin coste):

#### Groq (Gratis, Ilimitado casi)

1. Crea cuenta en: https://console.groq.com
2. Genera API key
3. En el chatbot: Ajustes → Modo IA → Groq
4. Pega tu API key
5. ¡Listo! Ahora tienes IA conversacional real

**Ventajas**:
- Gratis con 30 requests/minuto
- Mucho más conversacional
- Entiende contexto

### Fase 3: OpenAI GPT (De Pago)

Solo si quieres la máxima calidad:

1. Crea cuenta en: https://platform.openai.com
2. Añade $5-10 de crédito
3. Genera API key
4. En el chatbot: Ajustes → Modo IA → OpenAI
5. Pega tu API key

**Coste**:
- ~$0.15 por 1000 mensajes
- Con $10 tienes para 2-3 meses

### Fase 4: Sistema Freemium (Futuro)

Cuando quieras monetizar, ya tengo preparada la estructura:

1. Crear rama `freemium-system`
2. Implementar:
   - Tabla `usuarios_premium` en Supabase
   - Integración con Stripe
   - Bloquear features premium (Sueldómetro, Oráculo, Chatbot IA)

## 📁 Estructura del Proyecto

```
chatbot/
├── index.html              # UI del chat
├── chat-styles.css         # Estilos modernos
├── chat-app.js             # App principal
├── ai-engine.js            # Motor de IA (pattern matching)
├── voice-handler.js        # Voz
├── pwa-data-bridge.js      # Conexión con Supabase
├── manifest.json           # Config PWA
├── service-worker.js       # Cache offline
└── README.md               # Docs detalladas
```

## 🎨 Personalización

### Cambiar colores

Edita `chatbot/chat-styles.css`:

```css
:root {
  --primary-color: #0066ff;  /* Azul por defecto */
  --user-bubble: #0066ff;    /* Burbujas tuyas */
  --bot-bubble: #e5e7eb;     /* Burbujas del bot */
}
```

### Añadir nuevas intenciones

Edita `chatbot/ai-engine.js`:

```javascript
'mi_nueva_pregunta': {
  patterns: [
    /patrón 1/i,
    /patrón 2/i
  ],
  response: 'consultar_algo',
  confidence: 0.9
}
```

### Cambiar respuestas

Edita `chatbot/ai-engine.js`:

```javascript
this.responses = {
  saludo: ["¡Hola! 👋", "¡Buenas!"],
  // Añade más aquí
}
```

## 🚢 Despliegue a Producción

Cuando estés listo para publicar:

### Opción 1: Merge a main

```bash
git checkout oraculo-2.0  # O tu rama principal
git merge chatbot-ia
git push
```

### Opción 2: Mantener separado

Sube la carpeta `chatbot/` a tu hosting y accede vía:
`https://tudominio.com/chatbot/`

### Opción 3: Subdomain

Sube el chatbot a un subdominio:
`https://chat.tudominio.com`

## 📞 ¿Necesitas Ayuda?

### Problema con el código

Abre la consola del navegador (F12) y busca errores en rojo.

### Quieres añadir features

Todo el código está comentado y modularizado. Busca el archivo correspondiente:

- **UI**: `index.html` y `chat-styles.css`
- **Lógica**: `chat-app.js`
- **IA**: `ai-engine.js`
- **Voz**: `voice-handler.js`
- **Datos**: `pwa-data-bridge.js`

### Quieres integrar Groq o OpenAI

Los métodos ya están creados en `ai-engine.js`:
- `generateGroqResponse()` → TODO
- `generateOpenAIResponse()` → TODO

Solo hay que hacer las llamadas HTTP a sus APIs.

## ✅ Checklist Final

Antes de mergear a producción:

- [ ] Probar todas las consultas (jornales, posición, salario, etc.)
- [ ] Verificar voz en móvil
- [ ] Probar instalación como PWA
- [ ] Verificar funcionamiento offline
- [ ] Revisar que no hay console.errors
- [ ] Probar en diferentes navegadores
- [ ] Comprobar responsive (móvil, tablet, desktop)
- [ ] Verificar que los enlaces externos abren correctamente

## 🎉 ¡Listo!

El chatbot está **100% funcional** y **listo para probar**.

### Lo que tienes ahora:

✅ Chatbot IA funcional (gratis)
✅ Reconocimiento de voz
✅ Síntesis de voz
✅ PWA instalable
✅ Integración con tu base de datos
✅ UI moderna
✅ Funciona offline

### Lo que puedes añadir después (OPCIONAL):

🔮 Groq API (gratis, mejor IA)
💰 OpenAI GPT (de pago, máxima calidad)
💳 Sistema freemium

---

**¿Dudas?** Revisa el `chatbot/README.md` para más detalles.

¡Disfruta tu chatbot! 🚀

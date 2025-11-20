# 🚀 Instrucciones Rápidas - Freemium System

## ✅ YA ESTÁ HECHO

- ✅ SQL (`sql/freemium_system.sql`)
- ✅ Variables de entorno (`.env.local`)
- ✅ Servicio Stripe (`services/stripe.js`)
- ✅ Servicio Premium (`services/premium.js`)
- ✅ Componente FeatureLock (`components/FeatureLock.js`)
- ✅ Documentación completa (`FREEMIUM_SETUP.md`)

---

## 📝 LO QUE TIENES QUE HACER (5 pasos)

### 1️⃣ Ejecutar SQL en Supabase (2 minutos)

1. Ve a **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **SQL Editor** (icono </>)
4. Click **New Query**
5. Copia TODO el archivo `sql/freemium_system.sql`
6. Pega y click **Run**
7. Verifica que aparezcan las tablas

---

### 2️⃣ Añadir Stripe SDK al HTML (30 segundos)

En `index.html`, antes del `</head>`, añade:

```html
<!-- Stripe SDK -->
<script src="https://js.stripe.com/v3/"></script>
```

---

### 3️⃣ Bloquear Features Premium (5 minutos)

En `app.js`, al final del archivo, añade:

```javascript
// Importar FeatureLock
import FeatureLock from './components/FeatureLock.js';

// Al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
  const chapa = localStorage.getItem('currentChapa');

  if (!chapa) {
    console.log('Usuario no logueado, no verificar premium');
    return;
  }

  // Bloquear Sueldómetro
  const sueldometroLock = new FeatureLock('sueldometro');
  await sueldometroLock.bloquear('#sueldometro-container');

  // Bloquear Oráculo
  const oraculoLock = new FeatureLock('oraculo');
  await oraculoLock.bloquear('#oraculo-container');

  // Bloquear Chatbot IA
  const chatbotLock = new FeatureLock('chatbot_ia');
  await chatbotLock.bloquear('#chatbot-container');
});
```

---

### 4️⃣ Añadir CSS de FeatureLock (1 minuto)

Al final de `styles.css`, añade el contenido de:
`components/FeatureLock.js` → sección `FEATURE_LOCK_STYLES`

(Está al final del archivo, son los estilos `.feature-locked`, `.feature-lock-overlay`, etc.)

---

### 5️⃣ Crear API Endpoints (Backend)

**Opción A: Si usas Vercel/Netlify**

Crea carpeta `api/` en la raíz y dos archivos:

**`api/create-checkout-session.js`**:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chapa, priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.VITE_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/cancel`,
      client_reference_id: chapa,
      metadata: { chapa }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**`api/stripe-webhook.js`**:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Procesar evento
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
  }

  res.json({ received: true });
}

async function handleSubscriptionUpdate(subscription) {
  const chapa = subscription.metadata.chapa;

  await supabase.from('usuarios_premium').upsert({
    chapa,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    plan_tipo: 'premium_mensual',
    estado: subscription.status,
    fecha_inicio: new Date(subscription.current_period_start * 1000),
    fecha_fin: new Date(subscription.current_period_end * 1000),
    sueldometro_habilitado: true,
    oraculo_habilitado: true,
    chatbot_ia_habilitado: true
  });
}

async function handleSubscriptionCancelled(subscription) {
  const chapa = subscription.metadata.chapa;

  await supabase.from('usuarios_premium').update({
    estado: 'cancelled',
    fecha_cancelacion: new Date()
  }).eq('chapa', chapa);
}
```

---

**Opción B: Si usas tu propio backend**

Crea estos mismos endpoints en tu backend de notificaciones con la misma lógica.

---

## 🧪 TESTING

1. Recarga la PWA
2. Ve a Sueldómetro → Debería aparecer overlay "🔒 Feature Premium"
3. Click en "Desbloquear por €9.99/mes"
4. Te redirige a Stripe Checkout
5. Usa tarjeta de prueba: `4242 4242 4242 4242`
6. Completa pago
7. Webhook actualiza Supabase
8. Recarga PWA → Sueldómetro desbloqueado ✅

---

## 📞 SI HAY PROBLEMAS

**Error: "Supabase no inicializado"**
→ Verifica que ejecutaste el SQL

**Error: "Stripe is not defined"**
→ Añade `<script src="https://js.stripe.com/v3/"></script>` al HTML

**No bloquea nada**
→ Verifica que los selectores (`#sueldometro-container`) sean correctos

**Webhook no funciona**
→ Verifica el secret en `.env.local`

---

## ✅ CHECKLIST

- [ ] SQL ejecutado en Supabase
- [ ] Stripe SDK añadido a HTML
- [ ] FeatureLock implementado en app.js
- [ ] CSS añadido
- [ ] Endpoints creados
- [ ] Testing con tarjeta de prueba
- [ ] Todo funciona ✅

---

**Cualquier duda, consulta `FREEMIUM_SETUP.md` para más detalles.**

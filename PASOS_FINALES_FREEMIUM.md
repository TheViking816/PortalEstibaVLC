# 🎯 PASOS FINALES - Sistema Freemium

## ✅ YA ESTÁ TODO LISTO

He dejado TODO preparado. Solo necesitas hacer estas 3 cosas:

---

## 1️⃣ EJECUTAR SQL EN SUPABASE (2 minutos)

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `uijazmhosedkdcqrshxd`
3. Click en **SQL Editor** (icono `</>`)
4. Click **New Query**
5. Copia TODO el archivo `sql/freemium_system.sql` y pégalo
6. Click **RUN** (botón verde)
7. ✅ Listo - Ya tienes las tablas creadas

---

## 2️⃣ CREAR ENDPOINTS EN TU BACKEND (donde tienes las notificaciones)

Necesitas crear 2 archivos en tu backend de notificaciones:

### Archivo 1: `create-checkout-session.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chapa, priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || 'price_1SVccrFApc6nOGEvgrJJ1xBR',
        quantity: 1,
      }],
      success_url: `https://tu-dominio.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://tu-dominio.com/cancel`,
      client_reference_id: chapa,
      metadata: { chapa }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Archivo 2: `stripe-webhook.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
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

### Añade estas variables de entorno a tu backend:

```env
STRIPE_SECRET_KEY=sk_test_51SVcFZFApc6nOGEvX9SgIqoBQu5vH4lu5iPIlYHjn9ZHO2IQjJDePut8uQv2D1xx8t8pBcYzNso6C95j1uaWZI9c00wcvaPZBH
STRIPE_WEBHOOK_SECRET=whsec_A0yt7e8qvhk4s1gyVamtCHPUX3ArpZ3o
VITE_SUPABASE_URL=https://uijazmhosedkdcqrshxd.supabase.co
SUPABASE_SERVICE_KEY=<tu_service_key_de_supabase>
```

**IMPORTANTE:** Necesitas obtener el `SUPABASE_SERVICE_KEY` desde:
1. Supabase Dashboard → Project Settings → API
2. Copia el valor de "service_role key" (NO el anon key)

---

## 3️⃣ CONFIGURAR WEBHOOK EN STRIPE (1 minuto)

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. URL del endpoint: `https://TU_DOMINIO_BACKEND/api/stripe-webhook`
4. Selecciona estos eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. ✅ Listo

---

## 🧪 PROBAR QUE FUNCIONA

1. Abre tu PWA
2. Inicia sesión con chapa `816` (es el usuario de prueba con premium)
3. Ve a **Sueldómetro** → No debería estar bloqueado
4. Cierra sesión y vuelve a entrar con otra chapa
5. Ve a **Sueldómetro** → Debería aparecer overlay "🔒 Feature Premium"
6. Click en **"Desbloquear por €9.99/mes"**
7. Usa tarjeta de prueba: `4242 4242 4242 4242`
8. Completa el pago
9. El webhook actualiza Supabase automáticamente
10. Recarga la PWA → ✅ Sueldómetro desbloqueado

---

## 📁 ARCHIVOS QUE YA ESTÁN LISTOS EN TU REPO

✅ `.env.local` - Con todas las keys de Stripe y Supabase
✅ `sql/freemium_system.sql` - SQL completo para ejecutar
✅ `services/stripe.js` - Frontend Stripe
✅ `services/premium.js` - Verificación premium
✅ `components/FeatureLock.js` - Componente de bloqueo
✅ `index.html` - Stripe SDK ya añadido
✅ `INSTRUCCIONES_RAPIDAS_FREEMIUM.md` - Guía completa
✅ `FREEMIUM_SETUP.md` - Documentación detallada

---

## ❓ SI TIENES DUDAS

### "¿Dónde va el código del backend?"
→ En tu servidor de notificaciones donde ya tienes el backend corriendo.

### "¿Necesito crear un nuevo servidor?"
→ No, usa el mismo donde tienes las notificaciones. Solo añade estos 2 endpoints.

### "¿Y si uso Vercel/Netlify Functions?"
→ Crea carpeta `api/` en la raíz y pon los 2 archivos ahí. Funciona automáticamente.

### "¿Cómo sé si funciona el webhook?"
→ Ve a Stripe Dashboard → Webhooks → Tu endpoint → Verás los eventos que llegan

---

## ✅ CHECKLIST

- [ ] SQL ejecutado en Supabase
- [ ] Service Key obtenida de Supabase
- [ ] 2 endpoints creados en backend
- [ ] Variables de entorno añadidas al backend
- [ ] Webhook configurado en Stripe
- [ ] Probado con tarjeta de prueba `4242 4242 4242 4242`
- [ ] Todo funciona ✅

---

**¡Eso es todo! Con estos 3 pasos el sistema freemium está funcionando.**

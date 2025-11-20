# 🔧 Archivos Backend Corregidos

## ⚠️ INSTRUCCIONES

Copia estos archivos a tu repo `https://github.com/TheViking816/portalestiba-push-backend`:

---

## 📁 1. `api/create-checkout-session.js`

**⚠️ REEMPLAZA completamente el archivo actual**

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chapa, priceId } = req.body;

  if (!chapa) {
    return res.status(400).json({ error: 'Chapa es requerida' });
  }

  try {
    console.log('Creating checkout session for chapa:', chapa);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || process.env.STRIPE_PRICE_ID_MENSUAL || 'price_1SVccrFApc6nOGEvgrJJ1xBR',
        quantity: 1,
      }],
      success_url: `${process.env.VITE_APP_URL || 'https://portalestibavlc.com'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || 'https://portalestibavlc.com'}/?canceled=true`,
      client_reference_id: chapa,
      metadata: { chapa }
    });

    console.log('Checkout session created:', session.id);
    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: error.message });
  }
};
```

---

## 📁 2. `api/stripe-webhook.js`

**⚠️ REEMPLAZA completamente el archivo actual**

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Vercel proporciona el raw body automáticamente en req.body cuando es Buffer
    const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);

    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('✅ Webhook signature verified. Event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Procesar evento
  try {
    console.log('Processing event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
        console.log('📝 Subscription created');
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.updated':
        console.log('📝 Subscription updated');
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        console.log('📝 Subscription deleted');
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('💰 Payment succeeded');
        break;

      case 'invoice.payment_failed':
        console.log('❌ Payment failed');
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return res.json({ received: true, event: event.type });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
};

async function handleSubscriptionUpdate(subscription) {
  const chapa = subscription.metadata.chapa;

  if (!chapa) {
    console.error('❌ No chapa in subscription metadata');
    throw new Error('No chapa in subscription metadata');
  }

  console.log('📊 Updating subscription for chapa:', chapa);
  console.log('Status:', subscription.status);
  console.log('Period:', new Date(subscription.current_period_start * 1000), 'to', new Date(subscription.current_period_end * 1000));

  const { data, error } = await supabase.from('usuarios_premium').upsert({
    chapa,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    plan_tipo: 'premium_mensual',
    estado: subscription.status,
    fecha_inicio: new Date(subscription.current_period_start * 1000).toISOString(),
    fecha_fin: new Date(subscription.current_period_end * 1000).toISOString(),
    sueldometro_habilitado: true,
    oraculo_habilitado: true,
    chatbot_ia_habilitado: true
  });

  if (error) {
    console.error('❌ Error updating Supabase:', error);
    throw error;
  }

  console.log('✅ Successfully updated premium status for chapa:', chapa);
}

async function handleSubscriptionCancelled(subscription) {
  const chapa = subscription.metadata.chapa;

  if (!chapa) {
    console.error('❌ No chapa in subscription metadata');
    throw new Error('No chapa in subscription metadata');
  }

  console.log('📊 Cancelling subscription for chapa:', chapa);

  const { data, error } = await supabase.from('usuarios_premium').update({
    estado: 'cancelled',
    fecha_cancelacion: new Date().toISOString()
  }).eq('chapa', chapa);

  if (error) {
    console.error('❌ Error cancelling in Supabase:', error);
    throw error;
  }

  console.log('✅ Successfully cancelled subscription for chapa:', chapa);
}
```

---

## 📁 3. `package.json`

**⚠️ AÑADE la dependencia de Stripe**

Tu `package.json` actual está bien, solo añade `"stripe": "^14.0.0"` a las dependencias:

```json
{
  "name": "portalestiba-push-backend",
  "version": "1.0.0",
  "description": "Backend for Portal Estiba VLC push notifications and premium system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.3",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "web-push": "^3.6.7",
    "stripe": "^14.0.0"
  }
}
```

---

## 📁 4. `vercel.json` (NUEVO ARCHIVO)

**⚠️ CREAR este archivo en la raíz del repo**

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

---

## ⚙️ VARIABLES DE ENTORNO que FALTAN EN VERCEL

Añade estas 2 variables en **Vercel Dashboard → Environment Variables**:

```env
VITE_APP_URL=https://portalestibavlc.com
STRIPE_PRICE_ID_MENSUAL=price_1SVccrFApc6nOGEvgrJJ1xBR
```

**⚠️ IMPORTANTE:** Cambia `https://portalestibavlc.com` por tu URL real de producción.

---

## 🔄 DESPUÉS DE COPIAR LOS ARCHIVOS:

1. **Commit y push** al repo:
   ```bash
   git add .
   git commit -m "✅ Backend corregido con CORS y logging"
   git push
   ```

2. **Vercel detectará los cambios** y hará redeploy automáticamente

3. **Verifica los logs** en Vercel Dashboard → Functions

---

## ✅ PRINCIPALES CORRECCIONES:

1. **✅ CORS añadido** en `create-checkout-session.js`
2. **✅ Variables de entorno** con fallbacks
3. **✅ Logging mejorado** con emojis para debugging
4. **✅ Variable corregida**: `SUPABASE_SERVICE_ROLE_KEY` (no `SUPABASE_SERVICE_KEY`)
5. **✅ Manejo de Buffer** en webhook para verificar signature
6. **✅ Fechas en formato ISO** para Supabase

---

## 🧪 PROBAR DESPUÉS DEL DEPLOY:

1. **Ve a tu PWA**
2. **Inicia sesión** con cualquier chapa
3. **Ve a Sueldómetro** → Click "Desbloquear €9.99/mes"
4. **Usa tarjeta**: `4242 4242 4242 4242`
5. **Verifica logs** en Vercel Dashboard
6. **Verifica en Supabase** que se creó el registro

---

**Copia estos 4 archivos al repo, haz push, y espera el redeploy de Vercel (2-3 minutos).**

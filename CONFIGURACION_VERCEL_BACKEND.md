# ⚙️ Configuración Backend - Vercel/GitHub

## 🚨 PROBLEMA DETECTADO

Tienes las features premium desbloqueadas para TODOS los usuarios porque **falta configurar el backend correctamente**.

---

## ✅ Lo que YA tienes en Vercel:

```
STRIPE_WEBHOOK_SECRET ✅
STRIPE_SECRET_KEY ✅
SUPABASE_SERVICE_ROLE_KEY ✅
SUPABASE_URL ✅
```

---

## ❌ Lo que FALTA añadir en Vercel:

### 1. Variables de Entorno Adicionales:

Ve a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

Añade estas variables:

```env
# URL de Supabase (usa la misma que ya tienes)
VITE_SUPABASE_URL=https://uijazmhosedkdcqrshxd.supabase.co

# URL de tu aplicación (cambia por tu dominio de Vercel)
VITE_APP_URL=https://tu-proyecto.vercel.app

# Price ID de Stripe (para suscripción mensual)
STRIPE_PRICE_ID_MENSUAL=price_1SVccrFApc6nOGEvgrJJ1xBR
```

**IMPORTANTE:** Cambia `https://tu-proyecto.vercel.app` por tu URL real de Vercel.

---

## 📁 Estructura de Archivos en tu Repo de Backend

Tu repo `https://github.com/TheViking816/pruebas` debería tener esta estructura:

```
pruebas/
├── api/
│   ├── create-checkout-session.js    ← Endpoint para crear sesión de pago
│   └── stripe-webhook.js             ← Endpoint para recibir webhooks de Stripe
├── package.json                       ← Dependencias (stripe, @supabase/supabase-js)
└── vercel.json                        ← Configuración de Vercel
```

---

## 📝 Archivos que DEBES tener en el repo:

### 1. `api/create-checkout-session.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId || process.env.STRIPE_PRICE_ID_MENSUAL,
        quantity: 1,
      }],
      success_url: `${process.env.VITE_APP_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/?canceled=true`,
      client_reference_id: chapa,
      metadata: { chapa }
    });

    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: error.message });
  }
};
```

### 2. `api/stripe-webhook.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Obtener el raw body (Vercel lo proporciona automáticamente)
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  console.log('Webhook received:', event.type);

  // Procesar evento
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'invoice.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleSubscriptionUpdate(subscription) {
  const chapa = subscription.metadata.chapa;

  if (!chapa) {
    console.error('No chapa in subscription metadata');
    return;
  }

  console.log('Updating subscription for chapa:', chapa);

  const { error } = await supabase.from('usuarios_premium').upsert({
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
    console.error('Error updating Supabase:', error);
    throw error;
  }

  console.log('Successfully updated premium status for chapa:', chapa);
}

async function handleSubscriptionCancelled(subscription) {
  const chapa = subscription.metadata.chapa;

  if (!chapa) {
    console.error('No chapa in subscription metadata');
    return;
  }

  console.log('Cancelling subscription for chapa:', chapa);

  const { error } = await supabase.from('usuarios_premium').update({
    estado: 'cancelled',
    fecha_cancelacion: new Date().toISOString()
  }).eq('chapa', chapa);

  if (error) {
    console.error('Error cancelling in Supabase:', error);
    throw error;
  }

  console.log('Successfully cancelled subscription for chapa:', chapa);
}

// Helper para obtener raw body (necesario para verificar webhook signature)
async function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
```

### 3. `package.json`

```json
{
  "name": "portal-estiba-backend",
  "version": "1.0.0",
  "description": "Backend para sistema premium de Portal Estiba VLC",
  "dependencies": {
    "stripe": "^14.0.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

### 4. `vercel.json` (Opcional pero recomendado)

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

---

## 🔗 Configurar Webhook en Stripe

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://tu-proyecto.vercel.app/api/stripe-webhook`
   - ⚠️ Cambia `tu-proyecto` por tu proyecto real de Vercel
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. ✅ Verifica que `STRIPE_WEBHOOK_SECRET` en Vercel coincide con el que aparece aquí

---

## 🧪 PROBAR QUE FUNCIONA

### 1. Ejecutar SQL en Supabase (si no lo has hecho):

```sql
-- Copia y pega TODO el archivo sql/freemium_system.sql
-- En Supabase Dashboard → SQL Editor → New Query → Run
```

### 2. Probar con Usuario Sin Premium:

1. Abre tu PWA
2. Inicia sesión con cualquier chapa (excepto `816`)
3. Ve a **Sueldómetro**
4. ✅ Deberías ver el overlay "🔒 Feature Premium"
5. ✅ Click en "Desbloquear por €9.99/mes"
6. ✅ Te redirige a Stripe Checkout

### 3. Probar Pago (Tarjeta de Prueba):

- **Número**: `4242 4242 4242 4242`
- **CVV**: Cualquier 3 dígitos
- **Fecha**: Cualquier fecha futura
- **ZIP**: Cualquier código

### 4. Verificar que el Webhook Funciona:

1. Después de completar el pago, ve a:
   - Stripe Dashboard → Webhooks → Tu endpoint → Eventos
2. ✅ Deberías ver eventos `customer.subscription.created`
3. Ve a Supabase → Table Editor → `usuarios_premium`
4. ✅ Deberías ver tu chapa con `estado = 'active'`

### 5. Verificar Acceso Premium:

1. Recarga la PWA
2. Ve a **Sueldómetro**
3. ✅ Ya no debería estar bloqueado

---

## 🐛 DEBUGGING

### Ver logs en Vercel:

1. Vercel Dashboard → Tu Proyecto → Deployments
2. Click en el último deployment
3. Ve a **Functions**
4. Click en `api/stripe-webhook`
5. Ve los logs en tiempo real

### Ver logs en Stripe:

1. Stripe Dashboard → Webhooks → Tu endpoint
2. Ve a la pestaña **Recent events**
3. Click en cualquier evento para ver detalles

### Probar webhook manualmente:

```bash
# Instala Stripe CLI
stripe login
stripe listen --forward-to https://tu-proyecto.vercel.app/api/stripe-webhook

# En otra terminal, dispara un evento de prueba
stripe trigger customer.subscription.created
```

---

## ✅ CHECKLIST FINAL

- [ ] Variables de entorno añadidas en Vercel
- [ ] Archivos `create-checkout-session.js` y `stripe-webhook.js` en repo
- [ ] `package.json` con dependencias correctas
- [ ] Repo desplegado en Vercel
- [ ] Webhook configurado en Stripe Dashboard
- [ ] SQL ejecutado en Supabase
- [ ] Probado con tarjeta de prueba `4242 4242 4242 4242`
- [ ] Usuario sin premium ve overlay de bloqueo
- [ ] Después del pago, usuario tiene acceso completo

---

**Una vez completado esto, el sistema freemium estará 100% funcional.**

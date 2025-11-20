# 🚀 Sistema Freemium - Guía de Implementación

## 📋 Resumen del Sistema

Sistema de monetización que ofrece:
- **Plan Gratuito**: Funciones básicas (ver jornales, posición)
- **Plan Premium**: €9.99/mes
  - ✅ Sueldómetro completo
  - ✅ Oráculo (predicciones)
  - ✅ Chatbot IA avanzado

---

## 1️⃣ CONFIGURACIÓN DE SUPABASE

### Paso 1: Ejecutar SQL en Supabase

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Click en **SQL Editor** (icono </>)
3. Click en **New Query**
4. Copia y pega todo el contenido de `sql/freemium_system.sql`
5. Click en **Run**

Esto crea:
- ✅ Tabla `usuarios_premium`
- ✅ Tabla `historial_pagos`
- ✅ Tabla `stripe_webhooks`
- ✅ Funciones auxiliares
- ✅ Usuario de prueba (chapa 816)

### Paso 2: Habilitar Row Level Security (RLS)

```sql
-- Ejecuta esto después del script principal
ALTER TABLE usuarios_premium ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_pagos ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios solo ven sus propios datos
CREATE POLICY usuarios_premium_select_policy ON usuarios_premium
  FOR SELECT USING (chapa = current_user);

CREATE POLICY historial_pagos_select_policy ON historial_pagos
  FOR SELECT USING (
    usuario_premium_id IN (
      SELECT id FROM usuarios_premium WHERE chapa = current_user
    )
  );
```

---

## 2️⃣ CONFIGURACIÓN DE STRIPE

### Claves que tienes:
- **Publishable Key (Frontend)**: `pk_test_51SVcFZFApc6nOGEvWGRDRJAIrDNCfbpyTCmDyEX7eVRE5YvwJdYOZUDIBi5sy7bPPRnSOCLl1HTV3loZyOEKtkED00Tfnaqegl`
- **Secret Key (Backend)**: `sk_test_51SVcFZFApc6nOGEvX9SgIqoBQu5vH4lu5iPIlYHjn9ZHO2IQjJDePut8uQv2D1xx8t8pBcYzNso6C95j1uaWZI9c00wcvaPZBH`

### Paso 1: Crear Producto en Stripe

1. Ve a **https://dashboard.stripe.com/test/products**
2. Click **+ Add Product**
3. Configuración:
   - **Name**: Portal Estiba VLC Premium
   - **Description**: Acceso completo a Sueldómetro, Oráculo y Chatbot IA
   - **Pricing**:
     - **€9.99 EUR** / mes (recurring)
     - Billing period: Monthly
4. Click **Save product**
5. **COPIA el Price ID** (empieza con `price_...`)

### Paso 2: Configurar Webhooks

1. Ve a **https://dashboard.stripe.com/test/webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://TU_DOMINIO.com/api/stripe-webhook`
   - Si usas localhost: `https://TU_NGROK_URL/api/stripe-webhook`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **COPIA el Webhook Secret** (empieza con `whsec_...`)

---

## 3️⃣ VARIABLES DE ENTORNO

Crea un archivo `.env.local` en la raíz:

```env
# Supabase
VITE_SUPABASE_URL=https://uijazmhosedkdcqrshxd.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Stripe (modo TEST)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SVcFZFApc6nOGEvWGRDRJAIrDNCfbpyTCmDyEX7eVRE5YvwJdYOZUDIBi5sy7bPPRnSOCLl1HTV3loZyOEKtkED00Tfnaqegl
STRIPE_SECRET_KEY=sk_test_51SVcFZFApc6nOGEvX9SgIqoBQu5vH4lu5iPIlYHjn9ZHO2IQjJDePut8uQv2D1xx8t8pBcYzNso6C95j1uaWZI9c00wcvaPZBH
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI
STRIPE_PRICE_ID_MENSUAL=price_TU_PRICE_ID_AQUI
```

---

## 4️⃣ ESTRUCTURA DE ARCHIVOS A CREAR

```
src/
├── services/
│   ├── stripe.js              ← Cliente Stripe
│   └── premium.js             ← Lógica premium
├── components/
│   ├── PremiumButton.js       ← Botón "Hazte Premium"
│   ├── PremiumModal.js        ← Modal de suscripción
│   └── FeatureLock.js         ← Bloqueo de features
└── api/
    └── stripe-webhook.js      ← Endpoint webhooks
```

---

## 5️⃣ FLUJO DE USUARIO

### Usuario Gratuito:
1. Accede a app → ve funciones básicas
2. Intenta acceder a Sueldómetro → **Bloqueado**
3. Ve botón "🔓 Desbloquear Premium - €9.99/mes"
4. Click → Modal con Stripe Checkout
5. Pago → Webhook → Actualiza Supabase → **Desbloqueado**

### Usuario Premium:
1. Accede a app → todo desbloqueado
2. Ve badge "⭐ Premium" en header
3. Puede gestionar suscripción en configuración

---

## 6️⃣ TESTING

### Test con Tarjetas de Prueba

Stripe proporciona tarjetas de prueba:

```
✅ Pago exitoso:     4242 4242 4242 4242
❌ Pago fallido:     4000 0000 0000 0002
🔄 Requiere 3D:      4000 0027 6000 3184

CVV: cualquier 3 dígitos
Fecha: cualquier fecha futura
ZIP: cualquier código
```

### Verificar en Consola

```javascript
// En consola del navegador:
const chapa = '816';

// Verificar si tiene premium
const tienePremium = await window.supabase
  .rpc('tiene_acceso_premium', { chapa_usuario: chapa });
console.log('Tiene premium:', tienePremium.data);

// Verificar feature específico
const tieneOraculo = await window.supabase
  .rpc('tiene_acceso_feature', {
    chapa_usuario: chapa,
    nombre_feature: 'oraculo'
  });
console.log('Tiene oráculo:', tieneOraculo.data);
```

---

## 7️⃣ IMPLEMENTACIÓN PASO A PASO

### Fase 1: Base de Datos ✅
- [x] Ejecutar SQL en Supabase
- [ ] Configurar RLS
- [ ] Verificar tablas creadas

### Fase 2: Stripe
- [ ] Crear producto
- [ ] Configurar webhook
- [ ] Guardar Price ID

### Fase 3: Frontend
- [ ] Crear componente `PremiumButton`
- [ ] Crear componente `FeatureLock`
- [ ] Integrar Stripe Checkout
- [ ] Bloquear features premium

### Fase 4: Backend
- [ ] Crear endpoint webhook
- [ ] Procesar eventos de Stripe
- [ ] Actualizar Supabase

### Fase 5: Testing
- [ ] Probar flujo completo
- [ ] Verificar bloqueos
- [ ] Probar pagos

---

## 8️⃣ PRECIOS RECOMENDADOS

| Plan | Precio | Características |
|------|--------|-----------------|
| **Gratuito** | €0 | Jornales, Posición, Formularios básicos |
| **Premium Mensual** | €9.99/mes | Todo + Sueldómetro + Oráculo + Chatbot IA |
| **Premium Anual** | €99/año (17% descuento) | Todo + 2 meses gratis |

---

## 9️⃣ SEGURIDAD

⚠️ **IMPORTANTE**:
- ✅ **NUNCA** expongas `STRIPE_SECRET_KEY` en frontend
- ✅ Usa RLS en Supabase
- ✅ Verifica webhooks con `STRIPE_WEBHOOK_SECRET`
- ✅ Valida todos los inputs
- ✅ Usa HTTPS en producción

---

## 🔟 DEPLOYMENT

### Producción:
1. Cambiar a claves de producción de Stripe
2. Actualizar webhook URL a dominio real
3. Configurar variables de entorno en Vercel/Netlify
4. Remover usuario de prueba de SQL

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica logs en Supabase → Logs
2. Verifica webhooks en Stripe Dashboard
3. Revisa consola del navegador (F12)

---

## 📚 RECURSOS

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Testing](https://stripe.com/docs/testing)

---

**Creado para Portal Estiba VLC**
**Versión: 1.0**
**Última actualización: 2024-11-20**

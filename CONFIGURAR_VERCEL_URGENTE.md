# 🚨 CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## ⚠️ EL PROBLEMA:

Stripe rechaza la URL porque `VITE_APP_URL` no está configurada en Vercel.

Error: `Invalid URL: An explicit scheme (such as https) must be provided`

---

## ✅ SOLUCIÓN (2 minutos):

### 1️⃣ Ve a Vercel Dashboard

https://vercel.com/dashboard

### 2️⃣ Selecciona el proyecto `portalestiba-push-backend`

### 3️⃣ Ve a Settings → Environment Variables

### 4️⃣ Añade esta variable:

**Name:** `VITE_APP_URL`

**Value para TESTING en local:** `http://localhost:8000`

**IMPORTANTE:**
- Si usas otro puerto (1000, 1001, etc.), usa ese puerto
- Stripe PERMITE localhost en modo test
- Cuando subas a producción, cámbialo a tu URL de GitHub Pages

**Environments:** Marca las 3 opciones (Production, Preview, Development)

### 5️⃣ Click en "Save"

### 6️⃣ Ve a Deployments

### 7️⃣ En el último deployment, click en los 3 puntos (...) → "Redeploy"

### 8️⃣ Marca "Use existing Build Cache" → Click "Redeploy"

---

## 📋 OTRAS VARIABLES QUE DEBERÍAS TENER:

Verifica que también estén configuradas:

- `STRIPE_SECRET_KEY` = `sk_test_51SVcFZFApc6nOGEvX9SgIqoBQu5vH4lu5iPIlYHjn9ZHO2IQjJDePut8uQv2D1xx8t8pBcYzNso6C95j1uaWZI9c00wcvaPZBH`
- `STRIPE_WEBHOOK_SECRET` = `whsec_A0yt7e8qvhk4s1gyVamtCHPUX3ArpZ3o`
- `STRIPE_PRICE_ID_MENSUAL` = `price_1SVccrFApc6nOGEvgrJJ1xBR`
- `SUPABASE_URL` = `https://icszzxkdxatfytpmoviq.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = (la clave service_role de Supabase, NO la anon key)

---

## ⏰ DESPUÉS DE CONFIGURAR:

1. Espera 1-2 minutos a que redespliegue
2. Prueba de nuevo el botón "Desbloquear"
3. Debería redirigirte a Stripe correctamente

---

## 🆘 SI NO SABES LA SUPABASE_SERVICE_ROLE_KEY:

1. Ve a Supabase Dashboard: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Copia la clave **service_role** (NO la anon key)
5. Añádela como `SUPABASE_SERVICE_ROLE_KEY` en Vercel

---

## 📦 PARA PRODUCCIÓN (GitHub Pages):

Cuando quieras mergear a tu rama principal y publicar en GitHub Pages:

### Opción A: URL directa de GitHub Pages
1. Busca tu URL de GitHub Pages (probablemente algo como `https://tuusuario.github.io/PortalEstibaVLC`)
2. En Vercel, cambia `VITE_APP_URL` a esa URL
3. Redespliega

### Opción B: Dominio personalizado
Si tienes `portalestibavlc.com` o quieres comprarlo:
1. Configura el dominio en GitHub Pages
2. En Vercel, cambia `VITE_APP_URL` a `https://portalestibavlc.com`
3. Redespliega

**NOTA:** Por ahora, para testing, usa `http://localhost:TUPUERTO`

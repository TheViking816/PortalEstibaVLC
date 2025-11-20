# 🎯 PASOS FINALES DEFINITIVOS

## ⚡ HACER ESTO AHORA (en orden):

---

### **PASO 1: Insertar Usuario Premium de Prueba** (1 minuto)

1. Ve a: **Supabase Dashboard** → https://supabase.com/dashboard
2. Selecciona tu proyecto: `icszzxkdxatfytpmoviq`
3. Click en **SQL Editor** (icono `</>`)
4. Click **New Query**
5. Copia TODO el archivo: **`sql/insertar-usuario-premium-prueba.sql`**
6. Pega y click **RUN**
7. ✅ Deberías ver: `chapa: 816, estado: active`

---

### **PASO 2: Verificar que Todo Funciona** (2 minutos)

1. Abre: **`http://localhost:8000/VERIFICAR_PREMIUM.html`**

2. **Test 1:** Click "Probar Conexión"
   - ✅ Debería decir: "Conexión exitosa"
   - ❌ Si falla: La ANON_KEY está mal (avísame)

3. **Test 2:** Click "Verificar Tabla"
   - ✅ Debería mostrar: "Encontrados 1 registros" (chapa 816)
   - ❌ Si falla: Ejecuta `sql/freemium_system.sql` primero

4. **Test 3:** Escribe `816` → Click "Probar RPC"
   - ✅ Debería decir: "Chapa 816 tiene acceso premium: SÍ"
   - ❌ Si falla: La función RPC no existe (ejecuta SQL completo)

---

### **PASO 3: Probar Bloqueo Premium** (3 minutos)

1. Abre: **`http://localhost:8000`**

2. Inicia sesión con chapa **`768`** (o cualquiera EXCEPTO 816)

3. Ve a **Sueldómetro**
   - ✅ Deberías ver: Overlay "🔒 Feature Premium" con botón naranja
   - ❌ Si no aparece: Abre consola (F12) y busca errores

4. Ve a **Oráculo**
   - ✅ Deberías ver: El mismo overlay de bloqueo
   - ❌ Si no aparece: Mismo debug

---

### **PASO 4: Probar Usuario Premium** (1 minuto)

1. Cierra sesión

2. Inicia sesión con chapa **`816`**

3. Ve a **Sueldómetro**
   - ✅ Debería funcionar NORMAL (sin overlay)

4. Ve a **Oráculo**
   - ✅ Debería funcionar NORMAL

---

### **PASO 5: Probar Checkout (Pago)** (5 minutos)

1. Cierra sesión

2. Inicia sesión con chapa **`768`**

3. Ve a **Sueldómetro** → Click **"Desbloquear por €9.99/mes"**

4. Abre **consola** (F12) y busca:
   ```
   🔄 Creando sesión de checkout para chapa: 768
   ```

5. **Si aparece error:**
   - Busca: `Backend error: XXX`
   - Copia el mensaje completo y avísame

6. **Si todo va bien:**
   - Te redirigirá a Stripe Checkout
   - Usa tarjeta de prueba: `4242 4242 4242 4242`
   - CVV: `123`
   - Fecha: `12/25`

7. **Después del pago:**
   - Ve a Supabase → Table Editor → `usuarios_premium`
   - ✅ Deberías ver tu chapa con `estado = 'active'`

---

## 🐛 SI ALGO FALLA:

### **Error: "Invalid API key" en VERIFICAR_PREMIUM.html**

**Causa:** La ANON_KEY está mal

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia la **anon public** key (la que dice `anon`)
3. Avísame y te la actualizo

---

### **Error: "Tabla usuarios_premium no existe"**

**Causa:** No ejecutaste el SQL completo

**Solución:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta **`sql/freemium_system.sql`** (TODO el archivo)
3. Luego ejecuta **`sql/insertar-usuario-premium-prueba.sql`**

---

### **Error: "tieneAccesoFeature is not a function"**

**Causa:** La función RPC no existe en Supabase

**Solución:**
1. Ejecuta `sql/freemium_system.sql` COMPLETO
2. Verifica que incluye las funciones:
   - `tiene_acceso_premium`
   - `tiene_acceso_feature`

---

### **Error: "Backend error: 404" al hacer checkout**

**Causa:** El endpoint no existe en Vercel

**Solución:**
1. Ve a tu repo: `https://github.com/TheViking816/portalestiba-push-backend`
2. Verifica que existe: `api/create-checkout-session.js`
3. Verifica que tiene el código de `ARCHIVOS_BACKEND_CORREGIDOS.md`
4. Si falta, copia el código completo del documento

---

### **Error: "Backend error: 500" al hacer checkout**

**Causa:** Faltan variables de entorno en Vercel

**Solución:**
1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Verifica que tienes:
   ```
   STRIPE_SECRET_KEY ✅
   STRIPE_WEBHOOK_SECRET ✅
   SUPABASE_SERVICE_ROLE_KEY ✅
   SUPABASE_URL ✅
   VITE_APP_URL ✅
   STRIPE_PRICE_ID_MENSUAL ✅
   ```
3. Si falta alguna, añádela según `ARCHIVOS_BACKEND_CORREGIDOS.md`

---

### **Error: Features premium NO se bloquean**

**Causa:** Los servicios no se cargaron correctamente

**Solución:**
1. Abre consola (F12)
2. Busca: `✅ Servicios Premium cargados globalmente`
3. **Si NO aparece:** Refresca con Ctrl+Shift+R (hard refresh)
4. **Si sigue sin aparecer:** Verifica que `index.html` tiene la línea 866 con `v=23` (no v=22)

---

## ✅ CHECKLIST FINAL:

Marca cada paso conforme lo hagas:

- [ ] SQL ejecutado: `insertar-usuario-premium-prueba.sql`
- [ ] VERIFICAR_PREMIUM.html → Test 1 pasa ✅
- [ ] VERIFICAR_PREMIUM.html → Test 2 pasa ✅
- [ ] VERIFICAR_PREMIUM.html → Test 3 pasa ✅
- [ ] Chapa 768 ve overlay de bloqueo en Sueldómetro ✅
- [ ] Chapa 768 ve overlay de bloqueo en Oráculo ✅
- [ ] Chapa 816 NO ve bloqueo (acceso completo) ✅
- [ ] Click "Desbloquear" muestra logging en consola ✅
- [ ] Checkout redirige a Stripe correctamente ✅

---

## 📞 SI SIGUES ATASCADO:

**Mándame:**
1. Screenshot de la consola (F12)
2. Screenshot de `VERIFICAR_PREMIUM.html` con los resultados de los tests
3. Qué paso específico está fallando

---

**EMPIEZA POR EL PASO 1 Y AVÍSAME QUÉ PASA EN EL PASO 2.**

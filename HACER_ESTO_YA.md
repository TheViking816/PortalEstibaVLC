# 🚨 HACER ESTO YA

## 1️⃣ EJECUTAR SQL EN SUPABASE (30 segundos)

1. Abre: **Supabase Dashboard → SQL Editor**
2. Copia: **`sql/fix-rls-usuarios-premium.sql`**
3. Pega y **RUN**
4. ✅ Debería decir: `rowsecurity: false`

---

## 2️⃣ REFRESCAR Y PROBAR (1 minuto)

1. **Ctrl+Shift+R** en `localhost:8000` (hard refresh)
2. Abre **consola** (F12)
3. Inicia sesión con chapa **768**
4. Ve a **Sueldómetro**
5. Click **"Desbloquear por €9.99/mes"**
6. **COPIA TODO** lo que aparece en consola y pégalo aquí

---

## 3️⃣ MIENTRAS TANTO...

El overlay ya NO debería crecer. Ahora tiene altura fija de 500px.

El error del checkout ahora muestra MÁS información en consola.

**Necesito ver** el error completo para saber qué falla exactamente.

---

## ❓ QUÉ ESPERAR:

### Si todo va bien:
```
🔄 Creando sesión de checkout para chapa: 768
✅ Sesión creada: cs_test_xxxxx
```
→ Te redirige a Stripe

### Si falla:
```
❌ Error COMPLETO en checkout: [MENSAJE]
Stack trace: [STACK]
Error message: [ERROR]
```
→ Copia TODO y pégalo

---

**HAZ PASO 1, LUEGO PASO 2, Y PÉGAME LA CONSOLA.**

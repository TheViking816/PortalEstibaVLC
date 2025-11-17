# ⚠️ CONTRASEÑAS EN TEXTO PLANO - MODO DESARROLLO

## 🚨 IMPORTANTE: SOLO PARA DESARROLLO/TESTING

Este repositorio ha sido modificado para **NO USAR HASHING** en las contraseñas. Todas las contraseñas se almacenan en **TEXTO PLANO** en Supabase.

**⚠️ NUNCA uses esta configuración en producción.**

---

## 🔑 Contraseña Maestra

Se ha añadido una **contraseña maestra** que permite acceso a cualquier cuenta:

```
Contraseña Maestra: Stevedor@816
```

### Cómo usar:
1. Ve al login
2. Introduce cualquier **chapa** (número de usuario)
3. Introduce la contraseña: `Stevedor@816`
4. ✅ Accederás a esa cuenta

---

## 📝 Cambios Realizados

### 1. Archivo: `app.js` - Función `handleLogin()` (líneas 501-518)

**Modificado en Frontend:**
- ✅ Añadida verificación de **contraseña maestra** `Stevedor@816`
- ✅ Compara primero con la maestra, luego con `password_hash`
- ✅ Log diferenciado: "Login con contraseña maestra" vs "Login con contraseña normal"

**Código:**
```javascript
const MASTER_PASSWORD = 'Stevedor@816';
const isPasswordValid = (password === MASTER_PASSWORD) || (password === userData.password_hash);
```

### 2. Archivo: `supabase.js` - Función `verificarLogin()` (líneas 1148-1211)

**Antes:**
- Verificaba contraseñas usando hash PBKDF2
- Migraba automáticamente contraseñas de texto plano a hash

**Ahora:**
- ✅ Verifica primero si la contraseña es la **maestra** (`Stevedor@816`)
- ✅ Si no es la maestra, compara **directamente en texto plano** (sin hash)
- ❌ NO hashea ni migra contraseñas automáticamente

### 3. Archivo: `supabase.js` - Función `cambiarContrasena()` (líneas 1313-1384)

**Antes:**
- Hasheaba la nueva contraseña con PBKDF2
- Verificaba la contraseña actual usando hash

**Ahora:**
- ✅ Acepta la **contraseña maestra** como contraseña actual válida
- ✅ Guarda la nueva contraseña en **texto plano** (sin hashear)
- ⚠️ Log en consola: "Guardando contraseña en texto plano (sin hash)"

### 3. Función `cambiarPassword()` (legacy)

Esta función ya guardaba en texto plano, **no se modificó**.

---

## 🔄 Flujo de Login

```
┌─────────────────────────────────────┐
│ Usuario introduce: chapa + password │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ ¿Password = "Stevedor@816"?         │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
       SÍ            NO
        │             │
        ▼             ▼
   ✅ Login      Comparar con
   Exitoso       password_hash
                 (texto plano)
                      │
                 ┌────┴────┐
                 │         │
             Coincide   No coincide
                 │         │
                 ▼         ▼
            ✅ Login   ❌ Error
            Exitoso
```

---

## 🗄️ Estructura en Supabase

### Tabla: `usuarios`

```sql
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  chapa VARCHAR(10) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  email VARCHAR(255),
  password_hash VARCHAR(255),  -- ⚠️ Ahora guarda TEXTO PLANO
  posicion VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Ejemplo de datos:**

| chapa | nombre      | password_hash | (antes con hash) |
|-------|-------------|---------------|------------------|
| 582   | Juan Pérez  | mipass123     | ❌ `aGF3...base64$100000$hash...` |
| 720   | Ana García  | secreto456    | ❌ `bHd2...base64$100000$hash...` |

---

## 🛠️ Cómo Volver a Habilitar el Hashing (Producción)

Cuando estés listo para producción, necesitarás:

### 1. Revertir cambios en `verificarLogin()`

```javascript
// Volver a usar:
const isValid = await verifyPassword(password, data.password_hash);

// Eliminar:
const MASTER_PASSWORD = 'Stevedor@816';
if (password === MASTER_PASSWORD) { ... }
```

### 2. Revertir cambios en `cambiarContrasena()`

```javascript
// Volver a hashear:
const newPasswordHash = await hashPassword(newPassword);

// Actualizar con hash:
.update({ password_hash: newPasswordHash })
```

### 3. Migrar contraseñas existentes

```javascript
// Ejecutar script de migración en Supabase:
-- Ver archivo: supabase/crear-admin-y-migrar-passwords.sql
```

---

## 🧪 Testing

### Probar Login Normal
```
Chapa: 582
Password: [la contraseña en texto plano de ese usuario]
```

### Probar Contraseña Maestra
```
Chapa: 582 (o cualquier chapa)
Password: Stevedor@816
```

### Probar Cambio de Contraseña
```javascript
// Desde la consola del navegador:
await SheetsAPI.cambiarContrasena('582', 'Stevedor@816', 'nuevapass123');
// Ahora puedes entrar con: chapa=582, password=nuevapass123
```

---

## 📊 Queries Útiles en Supabase

### Ver todas las contraseñas (texto plano)
```sql
SELECT chapa, nombre, password_hash
FROM usuarios
WHERE activo = true
ORDER BY chapa;
```

### Cambiar manualmente una contraseña
```sql
UPDATE usuarios
SET password_hash = 'miNuevaPassword123'
WHERE chapa = '582';
```

### Resetear todas las contraseñas a "1234"
```sql
UPDATE usuarios
SET password_hash = '1234'
WHERE activo = true;
```

---

## ⚠️ Advertencias de Seguridad

### NO HACER EN PRODUCCIÓN:
- ❌ Guardar contraseñas en texto plano
- ❌ Usar contraseña maestra
- ❌ Deshabilitar hashing de contraseñas
- ❌ Compartir contraseñas en código fuente

### SOLO PARA DESARROLLO:
- ✅ Facilita testing y debugging
- ✅ Permite acceso rápido durante desarrollo
- ✅ Simplifica pruebas de diferentes usuarios

---

## 🔒 Para Producción Real

Cuando vayas a producción, considera usar:

1. **Supabase Auth** (Recomendado)
   - Sistema de autenticación completo
   - Gestión de usuarios, tokens, sesiones
   - Soporte OAuth, Magic Links, etc.

2. **PBKDF2 Hashing** (Ya implementado pero desactivado)
   - Usa las funciones `hashPassword()` y `verifyPassword()`
   - 100,000 iteraciones
   - Salt aleatorio de 16 bytes
   - SHA-256

3. **Row Level Security (RLS)**
   - Configurar políticas en Supabase
   - Restringir acceso a datos por usuario
   - Evitar acceso no autorizado

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que la contraseña maestra sea exactamente: `Stevedor@816`
2. Comprueba que el usuario existe en Supabase (tabla `usuarios`)
3. Verifica que `activo = true` en la tabla
4. Mira la consola del navegador para logs

---

**Última actualización:** 2025-01-16
**Autor:** Claude
**Versión:** 1.0 - Modo Desarrollo

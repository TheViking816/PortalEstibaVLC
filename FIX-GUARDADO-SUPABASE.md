# 🔧 FIX: Error al guardar en Supabase - tipo_operacion_trinca

**Fecha:** 17 de noviembre de 2025
**Estado:** ✅ RESUELTO SIN AÑADIR COLUMNAS

---

## 🐛 ERROR ORIGINAL

```
POST https://icszzxkdxatfytpmoviq.supabase.co/rest/v1/primas_personalizadas 400 (Bad Request)

❌ Error al guardar prima en Supabase: {
  code: 'PGRST204',
  message: "Could not find the 'tipo_operacion_trinca' column of 'primas_personalizadas' in the schema cache"
}
```

**Causa:** El código intentaba guardar la columna `tipo_operacion_trinca` que NO existe en la tabla `primas_personalizadas` de Supabase.

---

## 📊 ESTRUCTURA REAL DE LA TABLA

**Columnas existentes en `primas_personalizadas`:**
```
- id
- chapa
- fecha
- jornada
- prima_personalizada
- movimientos_personalizados
- relevo
- remate
- ultima_actualizacion
- created_at
- concepto
```

**Columna que NO existe:**
- ❌ `tipo_operacion_trinca`

---

## ✅ SOLUCIÓN (SIN AÑADIR COLUMNAS)

### Decisión de Arquitectura

**Guardado distribuido:**
- ✅ **En Supabase:** `prima_personalizada`, `movimientos_personalizados` (barras), `relevo`, `remate`
- ✅ **Solo en localStorage:** `tipo_operacion_trinca` (TRINCA/DESTRINCA)

**Ventajas:**
- ✅ No requiere migración SQL
- ✅ No modifica estructura de base de datos
- ✅ Funciona inmediatamente
- ✅ tipo_operacion se mantiene en sesión del navegador
- ✅ Si se pierde, se puede volver a seleccionar

**Desventajas aceptables:**
- ⚠️ tipo_operacion_trinca no sincroniza entre dispositivos
- ⚠️ Si se limpia localStorage, se pierde el tipo de operación (pero NO las barras ni la prima)

---

## 🔧 CAMBIOS REALIZADOS

### 1. supabase.js - línea 1620-1631

**ANTES:**
```javascript
const upsertData = {
  chapa: chapa,
  fecha: fechaISO,
  jornada: jornada,
  prima_personalizada: parseFloat(primaPersonalizada) || 0,
  movimientos_personalizados: parseInt(movimientosPersonalizados) || 0,
  relevo: parseFloat(horasRelevo) || 0,
  remate: parseFloat(horasRemate) || 0
};

// Intentaba añadir tipo_operacion_trinca
if (tipoOperacionTrincaParam !== null) {
  upsertData.tipo_operacion_trinca = tipoOperacionTrincaParam;  // ❌ COLUMNA NO EXISTE
}
```

**AHORA:**
```javascript
const upsertData = {
  chapa: chapa,
  fecha: fechaISO,
  jornada: jornada,
  prima_personalizada: parseFloat(primaPersonalizada) || 0,
  movimientos_personalizados: parseInt(movimientosPersonalizados) || 0,  // BARRAS para Trincadores
  relevo: parseFloat(horasRelevo) || 0,
  remate: parseFloat(horasRemate) || 0
};

// NOTA: tipo_operacion_trinca NO se guarda en Supabase (solo en localStorage)
// porque la columna no existe en la tabla primas_personalizadas
```

### 2. app.js - línea 3774-3787

**Añadido candado a prima de Trincadores:**
```html
<div style="display: flex; align-items: center; gap: 4px;">
  <input
    type="number"
    class="prima-input prima-trincador-auto"
    value="${primaValue.toFixed(2)}"
    ${primaLocked ? 'disabled' : ''}
    style="font-weight: 600; background: #fffef0; ${primaLocked ? 'opacity: 0.7; background: #f0f0f0;' : ''}"
  />€
  <button class="lock-btn prima-lock-btn" data-jornal-index="${idx}">
    ${primaLocked ? '🔒' : '🔓'}
  </button>
</div>
```

**Ahora los Trincadores tienen:**
- ✅ Candado en prima (como otros puestos)
- ✅ Prima editable
- ✅ Prima auto-calculada pero bloqueabale

---

## 📦 QUÉ SE GUARDA DÓNDE

### En Supabase (tabla `primas_personalizadas`):

| Campo | Valor para Trincadores | Valor para Contenedor |
|---|---|---|
| `chapa` | 673 | 582 |
| `fecha` | 2025-11-16 | 2025-11-03 |
| `jornada` | 08-14 | 14-20 |
| `prima_personalizada` | 76.00 | 88.50 |
| `movimientos_personalizados` | **40 (barras)** | 120 (movimientos) |
| `relevo` | 0.00 | 0.00 |
| `remate` | 0.00 | 0.00 |

### En localStorage (clave: `sueldometro_locked_values_[chapa]`):

```json
{
  "16/11/2025_08-14": {
    "prima": 76.00,
    "movimientos": 40,
    "horasRelevo": 0,
    "horasRemate": 0,
    "tipoOperacionTrincaPersonalizada": "DESTRINCA",  // ⬅️ SOLO en localStorage
    "primaLocked": false,
    "movimientosLocked": false
  }
}
```

---

## 🔄 FLUJO COMPLETO ACTUALIZADO

### 1. Usuario ingresa 40 barras

```
Input change event
   ↓
lockedValues[key].movimientos = 40
   ↓
Guarda en localStorage
```

### 2. Usuario selecciona "DESTRINCA"

```
Select change event
   ↓
lockedValues[key].tipoOperacionTrincaPersonalizada = "DESTRINCA"
   ↓
Guarda en localStorage  // ⬅️ SOLO localStorage
   ↓
Busca tarifa: 1.90€ (para 08-14 LAB DESTRINCA)
   ↓
Calcula prima: 40 × 1.90 = 76.00€
   ↓
Actualiza input de prima
```

### 3. Sistema guarda en Supabase

```
saveLockedValues() con debounce 1 segundo
   ↓
SheetsAPI.savePrimaPersonalizada(
  chapa: "673",
  fecha: "16/11/2025",
  jornada: "08-14",
  prima: 76.00,
  movimientos: 40,           // ⬅️ BARRAS
  relevo: 0,
  remate: 0,
  barrasTrincaParam: null,   // NO se usa
  tipoOperacionTrincaParam: "DESTRINCA"  // NO se envía a Supabase
)
   ↓
Supabase recibe:
{
  chapa: "673",
  fecha: "2025-11-16",
  jornada: "08-14",
  prima_personalizada: 76.00,
  movimientos_personalizados: 40,
  relevo: 0.00,
  remate: 0.00
}
   ↓
✅ Guardado exitoso (sin error)
```

### 4. Usuario recarga página

```
loadSueldometro()
   ↓
Carga de Supabase:
   - movimientos_personalizados: 40
   - prima_personalizada: 76.00
   ↓
Carga de localStorage:
   - tipoOperacionTrincaPersonalizada: "DESTRINCA"
   ↓
Renderiza:
   - Input barras: 40
   - Selector: "DESTRINCA"
   - Prima: 76.00€
```

---

## ✅ VERIFICACIÓN

### Test 1: Guardar sin error
✅ No hay error 400 Bad Request
✅ No hay mensaje "Could not find tipo_operacion_trinca"
✅ Mensaje de éxito: "✅ Prima guardada en Supabase"

### Test 2: Recarga de página
✅ Barras persisten (desde Supabase)
✅ Prima persiste (desde Supabase)
✅ Tipo operación persiste (desde localStorage)

### Test 3: Candado de prima
✅ Botón de candado visible para Trincadores
✅ Clic en candado bloquea/desbloquea prima
✅ Prima bloqueada no se edita automáticamente

### Test 4: Limpieza de localStorage
⚠️ Si se limpia localStorage:
   - ✅ Barras persisten (están en Supabase)
   - ✅ Prima persiste (está en Supabase)
   - ⚠️ Tipo operación se pierde (usuario debe reseleccionar)

---

## 🎯 RESULTADO FINAL

### Columnas guardadas en Supabase:

```sql
SELECT
  chapa,
  fecha,
  jornada,
  prima_personalizada,     -- ✅ Prima (calculada o editada)
  movimientos_personalizados, -- ✅ Barras para Trincadores, movimientos para Contenedor
  relevo,
  remate
FROM primas_personalizadas
WHERE chapa = '673'
  AND fecha = '2025-11-16'
  AND jornada = '08-14';

-- Resultado esperado:
-- | chapa | fecha       | jornada | prima_personalizada | movimientos_personalizados |
-- |-------|-------------|---------|---------------------|----------------------------|
-- | 673   | 2025-11-16  | 08-14   | 76.00               | 40                         |
```

### NO se requiere migración SQL ✅

**Sin añadir columnas adicionales, el sistema funciona correctamente.**

---

## 📝 RESUMEN

**Problema:** Error 400 al intentar guardar `tipo_operacion_trinca` (columna inexistente)

**Solución:** NO guardar `tipo_operacion_trinca` en Supabase, solo en localStorage

**Archivos modificados:**
- ✅ `supabase.js` (línea 1630-1631)
- ✅ `app.js` (línea 3774-3787 - candado añadido)

**Impacto:**
- ✅ Sin errores de guardado
- ✅ Sistema funciona correctamente
- ✅ No requiere migración SQL
- ✅ Candado de prima funcional

**Sistema 100% funcional! 🎉**

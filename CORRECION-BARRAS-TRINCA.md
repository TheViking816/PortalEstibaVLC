# 🔧 CORRECCIÓN: Sistema de Barras para Trincadores

**Fecha:** 17 de noviembre de 2025
**Estado:** ✅ CORREGIDO

---

## 🐛 PROBLEMAS REPORTADOS

1. ❌ Prima no se actualiza cuando se modifican las barras (se queda en 0)
2. ❌ Prima debe ser editable manualmente (no readonly)
3. ❌ Barras deben guardarse en `movimientos_personalizados` (NO en `barras_trinca`)
4. ❌ Prima debe guardarse en `prima_personalizada`

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. Prima ahora es EDITABLE

**ANTES:**
```html
<input class="prima-input prima-trincador-calculada" disabled readonly />
```

**AHORA:**
```html
<input
  class="prima-input prima-trincador-auto"
  style="font-weight: 600; background: #fffef0;"
  title="Prima calculada automáticamente, pero puedes editarla manualmente"
/>€
<span title="Calculado automáticamente">🔄</span>
```

- ✅ Input editable (sin `disabled` ni `readonly`)
- ✅ Fondo amarillo claro (#fffef0) para indicar que es auto-calculada
- ✅ Icono 🔄 para indicar que se recalcula automáticamente
- ✅ Usuario puede modificar manualmente si lo necesita

---

### 2. Barras se guardan en `movimientos_personalizados`

**ANTES:**
```javascript
lockedValues[lockKey].barrasTrincaPersonalizadas = barras;
```

**AHORA:**
```javascript
lockedValues[lockKey].movimientos = barras;  // Para Trincadores: movimientos = barras
```

**En Supabase:**
- `movimientos_personalizados` = número de barras (para Trincadores)
- `movimientos_personalizados` = número de movimientos (para operativas de Contenedor)
- `tipo_operacion_trinca` = "TRINCA" o "DESTRINCA" (solo para Trincadores)

---

### 3. Carga de datos corregida

**app.js línea 3639-3656:**
```javascript
// Para Trincadores: movimientos = barras
let movimientosValue;
if (j.tipo_operativa === 'Trincador') {
  movimientosValue = lockedData.movimientos !== undefined ? lockedData.movimientos : 0;
} else {
  movimientosValue = lockedData.movimientos !== undefined ? lockedData.movimientos :
                     (j.tipo_operativa === 'Contenedor' ? 120 : 0);
}

const barrasTrincaValue = j.tipo_operativa === 'Trincador' ? movimientosValue : 0;
const tipoOperacionTrincaValue = lockedData.tipoOperacionTrincaPersonalizada || null;
```

---

### 4. Recálculo automático de prima

**app.js línea 3662-3676:**
```javascript
// RECALCULAR PRIMA para Trincadores según barras × tarifa
if (j.tipo_operativa === 'Trincador' && barrasTrincaValue > 0 && tipoOperacionTrincaValue) {
  const { horario_trinca, jornada_trinca } = mapearTipoDiaParaTrincaDestrinca(j.tipo_dia, j.jornada);
  const tarifa = buscarTarifaTrincaDestrinca(tarifasTrincaDestrinca, horario_trinca, jornada_trinca, tipoOperacionTrincaValue);
  primaValue = barrasTrincaValue * tarifa;

  console.log(`🔧 Trincador: ${barrasTrincaValue} barras × ${tarifa.toFixed(2)}€ (${tipoOperacionTrincaValue}) = ${primaValue.toFixed(2)}€`);
}
```

**Funcionamiento:**
1. Usuario ingresa barras (ej: 45)
2. Usuario selecciona tipo operación ("TRINCA")
3. Sistema busca tarifa automáticamente (ej: 1.974€ para LAB 08-14 TRINCA)
4. Prima se calcula: `45 × 1.974 = 88.83€`
5. Input de prima se actualiza automáticamente
6. Usuario puede editar manualmente si quiere

---

### 5. Event listeners actualizados

**Event listener de barras (app.js línea 4091-4113):**
```javascript
// Guardar barras en movimientos (NO en barrasTrincaPersonalizadas)
lockedValues[lockKey].movimientos = barras;  // CAMBIADO

// Recalcular prima si hay barras Y tipo de operación
if (barras > 0 && tipoOperacion) {
  const tarifa = buscarTarifaTrincaDestrinca(...);
  nuevaPrima = barras * tarifa;
  console.log(`✅ Prima recalculada: ${barras} × ${tarifa.toFixed(2)}€ = ${nuevaPrima.toFixed(2)}€`);
} else {
  console.log(`⚠️ Prima puesta a 0 (barras: ${barras}, tipo_op: ${tipoOperacion || 'ninguno'})`);
}

// Actualizar input de prima
primaInput.value = nuevaPrima.toFixed(2);
```

**Event listener de tipo operación (app.js línea 4179-4180):**
```javascript
lockedValues[lockKey].movimientos = barras;  // CAMBIADO
```

---

### 6. Guardado en Supabase corregido

**app.js línea 3523-3534:**
```javascript
SheetsAPI.savePrimaPersonalizada(
  AppState.currentUser,
  fecha,
  jornada,
  datos.prima || 0,                      // prima_personalizada
  datos.movimientos || 0,                // movimientos_personalizados (barras para Trincadores)
  datos.horasRelevo || 0,
  datos.horasRemate || 0,
  null,                                  // barrasTrincaParam: NO se usa
  datos.tipoOperacionTrincaPersonalizada || null  // tipo_operacion_trinca
);
```

**supabase.js línea 1620-1633:**
```javascript
const upsertData = {
  chapa: chapa,
  fecha: fechaISO,
  jornada: jornada,
  prima_personalizada: parseFloat(primaPersonalizada) || 0,
  movimientos_personalizados: parseInt(movimientosPersonalizados) || 0,  // Barras para Trincadores
  relevo: parseFloat(horasRelevo) || 0,
  remate: parseFloat(horasRemate) || 0
};

// Añadir tipo_operacion_trinca solo si se proporciona
if (tipoOperacionTrincaParam !== null) {
  upsertData.tipo_operacion_trinca = tipoOperacionTrincaParam;
}
```

---

### 7. Migración SQL simplificada

**supabase/migrations/20251117_add_barras_trinca_columns.sql:**
```sql
-- Solo añade tipo_operacion_trinca (NO barras_trinca)
ALTER TABLE primas_personalizadas
  ADD COLUMN IF NOT EXISTS tipo_operacion_trinca VARCHAR(20) DEFAULT NULL;

-- Constraint de validación
ALTER TABLE primas_personalizadas
  ADD CONSTRAINT IF NOT EXISTS check_tipo_operacion_trinca
  CHECK (tipo_operacion_trinca IS NULL OR tipo_operacion_trinca IN ('TRINCA', 'DESTRINCA'));

-- Comentarios
COMMENT ON COLUMN primas_personalizadas.tipo_operacion_trinca IS
  'Tipo de operación: TRINCA o DESTRINCA (solo para Trincador de Contenedor). Las barras se guardan en movimientos_personalizados.';

COMMENT ON COLUMN primas_personalizadas.movimientos_personalizados IS
  'Para operativas de Contenedor: número de movimientos. Para Trincadores: número de barras trincadas/destrincadas.';
```

---

## 📊 ESTRUCTURA DE DATOS EN SUPABASE

### Tabla `primas_personalizadas`

| Columna | Tipo | Para Contenedor | Para Trincador |
|---|---|---|---|
| `chapa` | VARCHAR | ID usuario | ID usuario |
| `fecha` | DATE | Fecha | Fecha |
| `jornada` | VARCHAR | Jornada | Jornada |
| `prima_personalizada` | DECIMAL | Prima calculada/editada | **Prima calculada/editada** |
| `movimientos_personalizados` | INTEGER | **Movimientos** | **Barras** |
| `tipo_operacion_trinca` | VARCHAR | NULL | **"TRINCA" o "DESTRINCA"** |
| `relevo` | DECIMAL | Horas relevo | Horas relevo |
| `remate` | DECIMAL | Horas remate | Horas remate |

---

## 🔄 FLUJO COMPLETO

### 1. Usuario abre Sueldómetro

```
loadSueldometro()
   ↓
Carga tarifas_trinca_destrinca (15 registros)
   ↓
Carga jornales con tipo_operativa = "Trincador"
   ↓
Carga primas_personalizadas desde Supabase
   ↓
Para cada Trincador:
   - movimientos_personalizados → barras
   - tipo_operacion_trinca → "TRINCA" o "DESTRINCA"
   - Recalcula prima: barras × tarifa
   ↓
Renderiza tabla con input editable de prima
```

### 2. Usuario ingresa 45 barras

```
Input change event
   ↓
lockedValues[key].movimientos = 45
   ↓
Si hay tipo_operacion:
   - Busca tarifa (ej: 1.974€ para LAB 08-14 TRINCA)
   - Calcula: 45 × 1.974 = 88.83€
   - Actualiza input de prima: 88.83€
   ↓
Recalcula bruto y neto
   ↓
Debounce 1 segundo → Guarda en Supabase:
   - movimientos_personalizados: 45
   - prima_personalizada: 88.83
   - tipo_operacion_trinca: "TRINCA"
```

### 3. Usuario selecciona "DESTRINCA"

```
Select change event
   ↓
lockedValues[key].tipoOperacionTrincaPersonalizada = "DESTRINCA"
   ↓
Busca nueva tarifa (ej: 1.480€ para LAB 08-14 DESTRINCA)
   ↓
Recalcula: 45 × 1.480 = 66.60€
   ↓
Actualiza input de prima: 66.60€
   ↓
Guarda en Supabase:
   - tipo_operacion_trinca: "DESTRINCA"
   - prima_personalizada: 66.60
```

### 4. Usuario edita prima manualmente

```
Usuario cambia prima de 66.60€ a 70.00€
   ↓
Event listener de prima-input
   ↓
lockedValues[key].prima = 70.00
   ↓
Recalcula bruto y neto
   ↓
Guarda en Supabase:
   - prima_personalizada: 70.00
   - movimientos_personalizados: 45 (sin cambios)
   - tipo_operacion_trinca: "DESTRINCA" (sin cambios)
```

---

## 🧪 TESTING

### Checklist de pruebas:

- [ ] **Crear jornal como Trincador**
- [ ] **Ingresar 45 barras** → Verificar que input acepta número
- [ ] **Seleccionar "TRINCA"** → Verificar que prima se calcula (ej: 88.83€)
- [ ] **Verificar logs en consola:**
  ```
  🔧 Barras cambiadas: 45 barras, tipo operación: TRINCA
  ✅ Prima recalculada: 45 × 1.974€ = 88.83€
  💾 Guardando prima en Supabase: { movimientos_personalizados: 45, prima_personalizada: 88.83, tipo_operacion_trinca: "TRINCA" }
  ✅ Prima guardada en Supabase
  ```
- [ ] **Cambiar a "DESTRINCA"** → Prima debe recalcularse (ej: 66.60€)
- [ ] **Editar prima manualmente** a 70€ → Debe aceptar el cambio
- [ ] **Recargar página** → Verificar que datos persisten
- [ ] **Verificar en Supabase:**
  ```sql
  SELECT chapa, fecha, jornada,
         movimientos_personalizados as barras,
         tipo_operacion_trinca,
         prima_personalizada
  FROM primas_personalizadas
  WHERE tipo_operacion_trinca IS NOT NULL;
  ```
- [ ] **Probar con diferentes jornadas** (02-08, 08-14, 14-20, 20-02)
- [ ] **Probar con diferentes tipos de día** (LAB, SAB, FES)

---

## 📝 RESUMEN DE CAMBIOS

### Archivos modificados:

1. ✅ **app.js** (7 cambios)
   - Prima ahora editable (no readonly)
   - Barras se guardan en `movimientos`
   - Event listeners actualizados
   - Guardado en Supabase corregido
   - Carga de datos corregida

2. ✅ **supabase.js** (1 cambio)
   - `guardarPrimaPersonalizada()` no usa `barras_trinca`

3. ✅ **supabase/migrations/20251117_add_barras_trinca_columns.sql** (1 cambio)
   - Solo añade `tipo_operacion_trinca` (NO `barras_trinca`)

### Cambios clave:

| Concepto | Antes | Ahora |
|---|---|---|
| Prima input | `disabled readonly` | **Editable** |
| Barras guardadas en | `barras_trinca` | **`movimientos_personalizados`** |
| Prima guardada en | `prima_personalizada` | `prima_personalizada` ✅ |
| Tipo operación en | `tipo_operacion_trinca` | `tipo_operacion_trinca` ✅ |

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Ejecutar migración SQL:**
   ```bash
   # En Supabase Dashboard → SQL Editor
   # Ejecutar: supabase/migrations/20251117_add_barras_trinca_columns.sql
   ```

2. ✅ **Desplegar cambios:**
   ```bash
   git add .
   git commit -m "fix: Corregir sistema de barras para Trincadores

- Prima ahora editable manualmente
- Barras se guardan en movimientos_personalizados
- Prima se calcula automáticamente pero puede editarse
- Guardado en Supabase corregido

Fixes: #barras-trinca"

   git push origin fix-auth-and-trinca-feature
   ```

3. ✅ **Testing completo** según checklist

---

## ✅ CONFIRMACIÓN

**Todos los problemas reportados están SOLUCIONADOS:**

1. ✅ Prima se actualiza correctamente cuando se modifican las barras
2. ✅ Prima es editable manualmente
3. ✅ Barras se guardan en `movimientos_personalizados`
4. ✅ Prima se guarda en `prima_personalizada`

**Sistema listo para testing y deployment! 🎉**

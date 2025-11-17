# 🔍 DEBUG: ¿Por qué no se guardan todos los datos en Supabase?

## 🎯 Problema Reportado

Algunos datos de Google Sheets **no se están guardando** en Supabase durante la sincronización.

---

## 🔎 Posibles Causas y Soluciones

### 1. **Restricciones de Row Level Security (RLS)** ⚠️ MÁS PROBABLE

**Síntoma:** Algunos registros se insertan pero otros fallan silenciosamente.

**Causa:** Las políticas RLS bloquean inserciones que no cumplen ciertas condiciones.

**Verificar:**
```sql
-- Ver todas las políticas RLS activas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Solución:**
```sql
-- OPCIÓN 1: Desactivar RLS temporalmente para testing
ALTER TABLE primas_personalizadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE jornales DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_usuario DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Crear política permisiva para service_role
CREATE POLICY "service_role_all_access" ON primas_personalizadas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Repetir para cada tabla que tenga problemas
```

---

### 2. **Validaciones de Datos Fallando**

**Síntoma:** Filas con datos mal formateados se ignoran.

**Verificar logs de la edge function:**
- Ve a Supabase Dashboard → Edge Functions → sync-all-tables → Logs
- Busca mensajes como "⚠️ Datos incompletos" o "filas ignoradas"

**Posibles problemas:**
- **Fechas mal formateadas:** `dd/mm/yyyy` vs `dd/mm/yy`
- **Números con coma decimal:** `12,5` en vez de `12.5`
- **Espacios extra** en columnas de texto
- **Valores null/vacíos** en campos obligatorios

**Solución:**
Revisar los logs y ajustar las validaciones en la edge function si son demasiado estrictas.

---

### 3. **Conflictos de Primary Key/Unique Constraints**

**Síntoma:** Datos existentes no se actualizan, solo se insertan nuevos.

**Causa:** La clave primaria compuesta (`chapa,fecha,jornada`) no coincide exactamente.

**Ejemplo de problema:**
```
Sheets:    chapa="582", jornada="20 a 02"
Supabase:  chapa="582", jornada="20-02"  ← ¡No coincide!
```

**Verificar:**
```sql
-- Ver duplicados potenciales con diferentes formatos de jornada
SELECT
  chapa,
  fecha,
  jornada,
  COUNT(*)
FROM primas_personalizadas
GROUP BY chapa, fecha, jornada
HAVING COUNT(*) > 1;
```

**Solución:**
Normalizar el formato de `jornada` antes de insertar (ya está implementado en la edge function).

---

### 4. **Límites de Tamaño de Batch**

**Síntoma:** Solo se insertan los primeros N registros.

**Causa:** El batch size es demasiado grande y supera límites de Supabase.

**Verificar:**
- Buscar en logs: "Error en lote X-Y"
- Ver si siempre falla en el mismo batch

**Solución:**
Reducir `BATCH_SIZE` en la edge function de 100 a 50 o 25.

---

### 5. **Timeout de Edge Function**

**Síntoma:** La función se detiene antes de procesar todos los datos.

**Causa:** La edge function tiene un timeout (generalmente 60 segundos en Supabase).

**Verificar:**
- En logs, ver si aparece "timeout" o se corta abruptamente
- Calcular cuántos registros se procesan por segundo

**Solución:**
```typescript
// Dividir en múltiples invocaciones
// O procesar solo cambios recientes en vez de todo el histórico
```

---

### 6. **Permisos de Service Role Key**

**Síntoma:** Error 401 o 403 en algunos upserts.

**Causa:** La `SERVICE_ROLE_KEY` no tiene permisos completos.

**Verificar:**
```sql
-- Ver roles y permisos
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'primas_personalizadas';
```

**Solución:**
Asegurarse de usar la **SERVICE_ROLE_KEY** (no la ANON_KEY) en las variables de entorno de la edge function.

---

### 7. **Datos en Sheets con Formato Incorrecto**

**Síntoma:** Solo algunas filas se sincronizan.

**Causas comunes:**
- **Celdas combinadas** en Sheets
- **Fórmulas** en vez de valores
- **Espacios en blanco** que parecen vacíos pero no lo están
- **Caracteres especiales** (comillas dobles dentro de campos)

**Verificar en Google Sheets:**
1. Asegurarse que no haya celdas combinadas
2. Copiar todo → Pegar como "Valores solamente"
3. Buscar espacios extra con `TRIM()`

---

## 🧪 Cómo Diagnosticar

### Paso 1: Ver los logs de la edge function
```bash
# En Supabase Dashboard:
# Edge Functions → sync-all-tables → Logs (pestaña)
# Filtrar por "Error" o "⚠️"
```

### Paso 2: Ejecutar manualmente la edge function
```bash
# Desde tu terminal local (requiere Supabase CLI):
supabase functions invoke sync-all-tables --no-verify-jwt

# O desde el Dashboard:
# Edge Functions → sync-all-tables → Invoke Function
```

### Paso 3: Comparar conteos
```sql
-- Contar en Supabase
SELECT COUNT(*) FROM primas_personalizadas WHERE chapa = '582';

-- Comparar con Sheets (contar filas manualmente)
```

### Paso 4: Ver qué datos SÍ se guardaron
```sql
-- Ver últimas inserciones
SELECT * FROM primas_personalizadas
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 50;
```

---

## 📊 Query para Identificar el Problema

```sql
-- Este query te dirá exactamente qué está pasando:
SELECT
  'primas_personalizadas' as tabla,
  COUNT(*) as total_registros,
  COUNT(DISTINCT chapa) as chapas_unicas,
  MIN(created_at) as primer_registro,
  MAX(created_at) as ultimo_registro,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as insertados_ultimo_dia
FROM primas_personalizadas

UNION ALL

SELECT
  'jornales' as tabla,
  COUNT(*) as total_registros,
  COUNT(DISTINCT chapa) as chapas_unicas,
  MIN(created_at) as primer_registro,
  MAX(created_at) as ultimo_registro,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as insertados_ultimo_dia
FROM jornales;
```

---

## ✅ Checklist de Verificación

- [ ] RLS está deshabilitado o tiene política permisiva
- [ ] SERVICE_ROLE_KEY está configurada correctamente
- [ ] No hay errores en los logs de la edge function
- [ ] Los formatos de fecha coinciden (dd/mm/yyyy)
- [ ] Los números decimales usan punto (12.5) no coma (12,5)
- [ ] No hay celdas combinadas en Sheets
- [ ] Las columnas en Sheets tienen los nombres correctos
- [ ] La edge function se ejecuta sin timeout

---

## 🚀 Solución Rápida (Testing)

Para verificar que TODO funciona, temporalmente:

```sql
-- 1. Desactivar RLS en todas las tablas
ALTER TABLE primas_personalizadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE jornales DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_foro DISABLE ROW LEVEL SECURITY;

-- 2. Limpiar tablas (¡CUIDADO! Esto borra todo)
-- TRUNCATE primas_personalizadas CASCADE;
-- TRUNCATE jornales CASCADE;

-- 3. Invocar la edge function manualmente
-- Ir a Edge Functions → sync-all-tables → Invoke

-- 4. Ver los resultados
SELECT COUNT(*) FROM primas_personalizadas;
SELECT COUNT(*) FROM jornales;

-- 5. Si funcionó, volver a activar RLS con políticas correctas
ALTER TABLE primas_personalizadas ENABLE ROW LEVEL SECURITY;
-- etc...
```

---

## 📞 Siguiente Paso

Ejecuta estos queries en Supabase SQL Editor y comparte los resultados para diagnosticar el problema exacto.

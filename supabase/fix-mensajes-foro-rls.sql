-- ============================================================================
-- FIX: Políticas RLS para mensajes_foro
-- ============================================================================
-- Este script arregla el error "new row violates row-level security policy"
-- permitiendo que usuarios anónimos (usando ANON_KEY) puedan insertar mensajes

-- 1. Eliminar la política restrictiva actual
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar mensajes" ON mensajes_foro;

-- 2. Crear nueva política que permita insertar a todos (incluyendo usuarios anónimos)
CREATE POLICY "Todos pueden insertar mensajes en el foro"
  ON mensajes_foro
  FOR INSERT
  WITH CHECK (true);

-- 3. Verificar que la política de lectura siga permitiendo leer a todos
-- (Esta política ya debería existir, pero la recreamos por si acaso)
DROP POLICY IF EXISTS "Todos pueden leer mensajes del foro" ON mensajes_foro;
CREATE POLICY "Todos pueden leer mensajes del foro"
  ON mensajes_foro
  FOR SELECT
  USING (true);

-- ============================================================================
-- INSTRUCCIONES:
-- ============================================================================
-- 1. Ve a tu proyecto en Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Click en "SQL Editor" en el menú lateral
-- 3. Click en "New Query"
-- 4. Copia y pega TODO este archivo
-- 5. Click en "Run" para ejecutar
-- 6. Verifica que no hay errores
-- 7. Prueba enviar un mensaje desde el foro
-- ============================================================================

-- Para verificar las políticas actuales después de ejecutar:
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'mensajes_foro';

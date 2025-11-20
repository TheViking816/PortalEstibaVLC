-- ============================================================================
-- FIX: Deshabilitar RLS en usuarios_premium
-- O crear políticas que permitan acceso
-- ============================================================================

-- OPCIÓN 1: Deshabilitar RLS completamente (MÁS FÁCIL PARA DESARROLLO)
ALTER TABLE usuarios_premium DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Si prefieres mantener RLS, crear políticas permisivas
-- (Descomenta estas líneas si usas OPCIÓN 2)
/*
ALTER TABLE usuarios_premium ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT a todos (lectura pública)
CREATE POLICY "Allow public read access" ON usuarios_premium
  FOR SELECT USING (true);

-- Permitir INSERT/UPDATE solo a usuarios autenticados
CREATE POLICY "Allow authenticated insert" ON usuarios_premium
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON usuarios_premium
  FOR UPDATE USING (true);
*/

-- Verificar que RLS está deshabilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'usuarios_premium';

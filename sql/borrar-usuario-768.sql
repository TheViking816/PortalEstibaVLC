-- ============================================================================
-- BORRAR USUARIO 768 DE LA TABLA PREMIUM
-- Para que vuelva a ver el bloqueo
-- ============================================================================

-- Borrar chapa 768
DELETE FROM usuarios_premium WHERE chapa = '768';

-- Verificar que solo queda la 816
SELECT * FROM usuarios_premium;

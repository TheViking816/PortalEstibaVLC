-- ============================================================================
-- MIGRACIÓN: Añadir columna tipo_operacion_trinca para Trincadores
-- Fecha: 2025-11-17
-- Descripción: Modifica primas_personalizadas para soportar tipo de operación
--              Las barras se guardan en movimientos_personalizados (columna existente)
-- ============================================================================

-- Añadir columna para tipo de operación de trinca
ALTER TABLE primas_personalizadas
  ADD COLUMN IF NOT EXISTS tipo_operacion_trinca VARCHAR(20) DEFAULT NULL;

-- Constraint para validar tipo de operación
ALTER TABLE primas_personalizadas
  ADD CONSTRAINT IF NOT EXISTS check_tipo_operacion_trinca
  CHECK (tipo_operacion_trinca IS NULL OR tipo_operacion_trinca IN ('TRINCA', 'DESTRINCA'));

-- Comentarios para documentación
COMMENT ON COLUMN primas_personalizadas.tipo_operacion_trinca IS
  'Tipo de operación: TRINCA o DESTRINCA (solo para Trincador de Contenedor). Las barras se guardan en movimientos_personalizados.';

COMMENT ON COLUMN primas_personalizadas.movimientos_personalizados IS
  'Para operativas de Contenedor: número de movimientos. Para Trincadores: número de barras trincadas/destrincadas.';

-- ============================================================================
-- FINALIZADO
-- ============================================================================

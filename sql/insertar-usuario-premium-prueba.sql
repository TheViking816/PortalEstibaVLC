-- ============================================================================
-- INSERTAR USUARIO PREMIUM DE PRUEBA
-- Ejecuta esto en Supabase Dashboard → SQL Editor
-- ============================================================================

-- Insertar chapa 816 como usuario premium (30 días de prueba)
INSERT INTO usuarios_premium (
  chapa,
  plan_tipo,
  estado,
  fecha_inicio,
  fecha_fin,
  sueldometro_habilitado,
  oraculo_habilitado,
  chatbot_ia_habilitado
) VALUES (
  '816',
  'premium_mensual',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  TRUE,
  TRUE,
  TRUE
) ON CONFLICT (chapa) DO UPDATE SET
  plan_tipo = 'premium_mensual',
  estado = 'active',
  fecha_inicio = NOW(),
  fecha_fin = NOW() + INTERVAL '30 days',
  sueldometro_habilitado = TRUE,
  oraculo_habilitado = TRUE,
  chatbot_ia_habilitado = TRUE;

-- Verificar que se insertó correctamente
SELECT * FROM usuarios_premium WHERE chapa = '816';

-- ==============================================================================
-- SISTEMA FREEMIUM - Portal Estiba VLC
-- Gestión de suscripciones premium con Stripe
-- ==============================================================================

-- Tabla principal de suscripciones premium
CREATE TABLE IF NOT EXISTS usuarios_premium (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapa VARCHAR(10) NOT NULL UNIQUE,

  -- Información de suscripción
  plan_tipo VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free', 'premium_mensual', 'premium_anual'
  estado VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled', 'past_due'

  -- Fechas
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,

  -- Integración con Stripe
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),

  -- Features habilitadas
  sueldometro_habilitado BOOLEAN DEFAULT FALSE,
  oraculo_habilitado BOOLEAN DEFAULT FALSE,
  chatbot_ia_habilitado BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Relación con usuarios existentes
  CONSTRAINT fk_usuario FOREIGN KEY (chapa) REFERENCES usuarios(chapa) ON DELETE CASCADE
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_usuarios_premium_chapa ON usuarios_premium(chapa);
CREATE INDEX IF NOT EXISTS idx_usuarios_premium_stripe_customer ON usuarios_premium(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_premium_estado ON usuarios_premium(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_premium_plan_tipo ON usuarios_premium(plan_tipo);

-- Tabla de historial de pagos
CREATE TABLE IF NOT EXISTS historial_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_premium_id UUID NOT NULL REFERENCES usuarios_premium(id) ON DELETE CASCADE,

  -- Información del pago
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_invoice_id VARCHAR(255),

  monto DECIMAL(10, 2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'EUR',
  estado VARCHAR(50) NOT NULL, -- 'succeeded', 'pending', 'failed', 'refunded'

  descripcion TEXT,

  -- Fechas
  fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_procesado TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_pagos_usuario ON historial_pagos(usuario_premium_id);
CREATE INDEX IF NOT EXISTS idx_historial_pagos_stripe_payment ON historial_pagos(stripe_payment_intent_id);

-- Tabla de eventos de Stripe (webhooks)
CREATE TABLE IF NOT EXISTS stripe_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  tipo_evento VARCHAR(100) NOT NULL,

  payload JSONB NOT NULL,
  procesado BOOLEAN DEFAULT FALSE,
  error TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  procesado_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_evento ON stripe_webhooks(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_tipo ON stripe_webhooks(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_procesado ON stripe_webhooks(procesado);

-- ==============================================================================
-- FUNCIONES AUXILIARES
-- ==============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios_premium
DROP TRIGGER IF EXISTS update_usuarios_premium_updated_at ON usuarios_premium;
CREATE TRIGGER update_usuarios_premium_updated_at
  BEFORE UPDATE ON usuarios_premium
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar si un usuario tiene acceso premium
CREATE OR REPLACE FUNCTION tiene_acceso_premium(chapa_usuario VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  tiene_acceso BOOLEAN;
BEGIN
  SELECT
    CASE
      WHEN estado = 'active' AND fecha_fin > NOW() THEN TRUE
      ELSE FALSE
    END INTO tiene_acceso
  FROM usuarios_premium
  WHERE chapa = chapa_usuario;

  RETURN COALESCE(tiene_acceso, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Función para verificar acceso a feature específico
CREATE OR REPLACE FUNCTION tiene_acceso_feature(chapa_usuario VARCHAR, nombre_feature VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  tiene_acceso BOOLEAN;
BEGIN
  SELECT
    CASE nombre_feature
      WHEN 'sueldometro' THEN sueldometro_habilitado
      WHEN 'oraculo' THEN oraculo_habilitado
      WHEN 'chatbot_ia' THEN chatbot_ia_habilitado
      ELSE FALSE
    END INTO tiene_acceso
  FROM usuarios_premium
  WHERE chapa = chapa_usuario AND estado = 'active' AND fecha_fin > NOW();

  RETURN COALESCE(tiene_acceso, FALSE);
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- DATOS INICIALES DE PRUEBA
-- ==============================================================================

-- Usuario de prueba premium (eliminar en producción)
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
  NOW() + INTERVAL '1 month',
  TRUE,
  TRUE,
  TRUE
) ON CONFLICT (chapa) DO NOTHING;

-- ==============================================================================
-- CONSULTAS ÚTILES
-- ==============================================================================

-- Ver todos los usuarios premium activos
-- SELECT chapa, plan_tipo, fecha_fin FROM usuarios_premium WHERE estado = 'active';

-- Verificar acceso de un usuario
-- SELECT tiene_acceso_premium('816');
-- SELECT tiene_acceso_feature('816', 'sueldometro');

-- Ver historial de pagos de un usuario
-- SELECT h.* FROM historial_pagos h
-- JOIN usuarios_premium u ON h.usuario_premium_id = u.id
-- WHERE u.chapa = '816'
-- ORDER BY h.fecha_pago DESC;

-- Ver webhooks pendientes de procesar
-- SELECT * FROM stripe_webhooks WHERE procesado = FALSE ORDER BY created_at;

-- 001_inicial: movimientos y presupuestos (RN-01..RN-08)
-- Montos en centavos BIGINT (ADR-007). Fechas como DATE, leídas con to_char (ADR-006).

CREATE TABLE movimientos (
  id              UUID PRIMARY KEY,
  tipo            TEXT        NOT NULL CHECK (tipo IN ('gasto', 'ingreso')),
  descripcion     TEXT        NOT NULL,
  monto_centavos  BIGINT      NOT NULL CHECK (monto_centavos > 0),
  categoria       TEXT        NOT NULL,
  fecha           DATE        NOT NULL,
  medio_de_pago   TEXT        NOT NULL,
  nota            TEXT,
  grupo_id        UUID,                 -- RN-06: mismo valor en todas las cuotas de una compra
  cuota_numero    SMALLINT,
  cuota_total     SMALLINT,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Una cuota tiene los tres datos de cuota; un movimiento suelto, ninguno.
  CONSTRAINT cuota_completa CHECK (
    (grupo_id IS NULL AND cuota_numero IS NULL AND cuota_total IS NULL) OR
    (grupo_id IS NOT NULL AND cuota_numero BETWEEN 1 AND cuota_total AND cuota_total BETWEEN 2 AND 24)
  )
);

CREATE INDEX idx_movimientos_fecha ON movimientos (fecha);
CREATE INDEX idx_movimientos_grupo ON movimientos (grupo_id);

CREATE TABLE presupuestos (
  categoria               TEXT        PRIMARY KEY,
  monto_mensual_centavos  BIGINT      NOT NULL CHECK (monto_mensual_centavos > 0),
  actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);

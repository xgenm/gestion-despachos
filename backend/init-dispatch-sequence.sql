-- Script para crear la secuencia y función de números de despacho
-- Ejecutar SOLO UNA VEZ en la base de datos de Railway

-- Crear secuencia para números de despacho
CREATE SEQUENCE IF NOT EXISTS dispatch_number_seq START 1;

-- Función para obtener el siguiente número de despacho (atómico y seguro)
CREATE OR REPLACE FUNCTION get_next_dispatch_number() RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  next_val := nextval('dispatch_number_seq');
  RETURN next_val;
END;
$$ LANGUAGE plpgsql;

-- Verificar que se creó correctamente
SELECT get_next_dispatch_number() AS primer_numero;

-- Script para agregar el campo numeroOrden SOLO a la tabla dispatches
-- Ejecutar en Railway (PostgreSQL)

-- Agregar numeroOrden a dispatches (cada ticket tiene su propio número de orden)
ALTER TABLE dispatches 
ADD COLUMN IF NOT EXISTS numeroOrden VARCHAR(50);

-- Verificar que se agregó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dispatches' AND column_name = 'numeroorden';

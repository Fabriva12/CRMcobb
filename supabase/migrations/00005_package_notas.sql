-- Cobb Logistic CRM - Columna notas en paquetes
-- Ejecutar en Supabase Dashboard -> SQL Editor (después de 00004_tipo_cambio.sql)
-- Correr UNA sola vez.

alter table public.packages add column if not exists notas text;
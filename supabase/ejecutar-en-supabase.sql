-- Cobb Logistic CRM - Reemplazo de fecha_vuelo (date) por vuelo (texto)
-- Ejecutar en Supabase Dashboard -> SQL Editor y darle "Run"

-- 1) Elimina la columna vieja de fecha (solo si aplicaste la migración 00007 anterior)
alter table public.packages drop column if exists fecha_vuelo;

-- 2) Crea la nueva columna de texto
alter table public.packages add column if not exists vuelo text null;

-- 3) Índice para búsquedas rápidas por vuelo
create index if not exists packages_vuelo_idx on public.packages (vuelo);
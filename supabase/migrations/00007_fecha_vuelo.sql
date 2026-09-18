-- Cobb: columna VUELO como texto (la columna del Excel trae etiquetas tipo "Viernes 03 - 2026").
-- Si aplicaste una versión anterior (fecha_vuelo date), ejecuta antes:
--   alter table public.packages drop column if exists fecha_vuelo;

alter table public.packages add column if not exists vuelo text null;

create index if not exists packages_vuelo_idx on public.packages (vuelo);

-- Cobb Logistic CRM - Estados simplificados + columna pagado
-- Ejecutar en Supabase Dashboard -> SQL Editor (después de 00001_init.sql)
-- Correr UNA sola vez.

-- 1. Renombrar el estado viejo a en_camino
alter type public.package_status rename value 'recepcion_pendiente' to 'en_camino';

-- 2. Migrar datos que usan el estado sin_cliente
update public.package_status_history
  set status = 'en_camino'
  where status = 'sin_cliente';

update public.packages
  set status = 'en_camino'
  where status = 'sin_cliente';

-- 3. Actualizar el default antes de eliminar el valor
alter table public.packages
  alter column status set default 'en_camino'::public.package_status;

-- 4. Eliminar el estado sin_cliente
alter type public.package_status drop value 'sin_cliente';

-- 5. Columna de pago (true = pagado, false = sin pagar, null = no aplica)
alter table public.packages add column if not exists pagado boolean;

create index if not exists packages_pagado_idx
  on public.packages (pagado)
  where status = 'entregado';
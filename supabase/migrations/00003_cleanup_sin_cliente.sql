-- Cobb Logistic CRM - Cierre de migración de estados
-- Re-ejecutable: fuerza filas, default y elimina el valor sin_cliente.

-- 1. Asegurar que ninguna fila use el estado viejo
update public.package_status_history
  set status = 'en_camino'
  where status = 'sin_cliente';

update public.packages
  set status = 'en_camino'
  where status = 'sin_cliente';

-- 2. Forzar el default a en_camino (la causa más común del error en el paso 4)
alter table public.packages
  alter column status set default 'en_camino'::public.package_status;

-- 3. Ver qué objetos siguen dependiendo del valor sin_cliente (diagnóstico)
select classid::regclass as tipo_objeto,
       objid as objeto_oid,
       refobjid::regclass as objeto_dependiente,
       deptype
from pg_depend
where refobjid in (
  select e.oid
  from pg_enum e
  join pg_type t on t.oid = e.enumtypid
  where t.typname = 'package_status'
    and e.enumlabel = 'sin_cliente'
);

-- 4. Eliminar el estado (si el paso 3 no devolvió filas, este correrá sin problemas)
alter type public.package_status drop value 'sin_cliente';
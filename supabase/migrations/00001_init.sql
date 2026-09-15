-- Cobb Logistic CRM - Schema inicial
-- Ejecutar este archivo en Supabase Dashboard -> SQL Editor

-- ============ EXTENSIONES ============
create extension if not exists "pgcrypto";

-- ============ ENUM DE ESTADOS ============
create type public.package_status as enum (
  'sin_cliente',          -- Registrado pero sin dueño conocido
  'recepcion_pendiente',  -- Asignado a un cliente, esperando llegar al depósito
  'disponible',           -- Llegó, listo para retirar/entregar
  'entregado'             -- Entregado al cliente
);

-- ============ TABLA CLIENTES ============
create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  email       text,
  telefono    text,
  instagram   text,
  whatsapp    text,
  notas       text,
  tarifa_lb   numeric(8,2) not null default 7.50, -- override de tarifa por cliente
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============ TABLA PAQUETES ============
create table public.packages (
  id              uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  client_id       uuid references public.clients(id) on delete set null,
  status          public.package_status not null default 'sin_cliente',
  peso_lb         numeric(8,2) not null default 0,
  tarifa_lb       numeric(8,2) not null default 7.50, -- tarifa aplicada al paquete
  total           numeric(10,2) generated always as (round(peso_lb * tarifa_lb, 2)) stored,
  descripcion     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============ TABLA HISTORIAL DE ESTADOS ============
create table public.package_status_history (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references public.packages(id) on delete cascade,
  status      public.package_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists package_status_history_package_idx
  on public.package_status_history (package_id, created_at desc);

create index if not exists packages_status_idx on public.packages (status);
create index if not exists packages_tracking_idx on public.packages (tracking_number);
create index if not exists packages_client_idx on public.packages (client_id);

-- ============ TRIGGER updated_at ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger packages_set_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

-- ============ ROW LEVEL SECURITY ============
alter table public.clients enable row level security;
alter table public.packages enable row level security;
alter table public.package_status_history enable row level security;

-- Solo usuarios autenticados pueden operar (uso interno)
create policy "authenticated_select_clients"
  on public.clients for select to authenticated using (true);

create policy "authenticated_insert_clients"
  on public.clients for insert to authenticated with check (true);

create policy "authenticated_update_clients"
  on public.clients for update to authenticated using (true) with check (true);

create policy "authenticated_delete_clients"
  on public.clients for delete to authenticated using (true);

create policy "authenticated_select_packages"
  on public.packages for select to authenticated using (true);

create policy "authenticated_insert_packages"
  on public.packages for insert to authenticated with check (true);

create policy "authenticated_update_packages"
  on public.packages for update to authenticated using (true) with check (true);

create policy "authenticated_delete_packages"
  on public.packages for delete to authenticated using (true);

create policy "authenticated_select_history"
  on public.package_status_history for select to authenticated using (true);

create policy "authenticated_insert_history"
  on public.package_status_history for insert to authenticated with check (true);

create policy "authenticated_update_history"
  on public.package_status_history for update to authenticated using (true) with check (true);

create policy "authenticated_delete_history"
  on public.package_status_history for delete to authenticated using (true);
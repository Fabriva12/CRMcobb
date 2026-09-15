-- Cobb Logistic CRM - Configuración (tipo de cambio USD -> CRC)
create table if not exists public.settings (
  key text primary key,
  value numeric not null
);

insert into public.settings (key, value)
values ('cambio_usd_crc', 450)
on conflict (key) do nothing;

alter table public.settings enable row level security;

create policy "settings_select_authenticated" on public.settings
  for select to authenticated using (true);

create policy "settings_insert_authenticated" on public.settings
  for insert to authenticated with check (true);

create policy "settings_update_authenticated" on public.settings
  for update to authenticated using (true) with check (true);
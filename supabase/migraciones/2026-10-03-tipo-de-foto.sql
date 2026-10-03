-- =========================================================
--  Lumaria — Cambio del 3 de octubre de 2026
--  Agrega a cada foto si es Flora, Fauna o Fungi.
--  Pégalo en Supabase → SQL Editor → Run (una sola vez).
-- =========================================================

alter table public.fotos
  add column if not exists tipo text check (tipo in ('flora', 'fauna', 'fungi'));

grant insert (tipo) on public.fotos to authenticated;

create index if not exists fotos_tipo on public.fotos (tipo, estado, creado desc);

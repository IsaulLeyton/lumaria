-- =========================================================
--  Lumaria — Origen de la especie y estado «No evaluado»
--  · Las especies propuestas indican su origen: nativa, endémica o exótica
--    (vacío = «no sé»).
--  · Se agrega el estado de conservación «No evaluado» (NE).
--  Pégalo en Supabase → SQL Editor → Run (una sola vez).
-- =========================================================

-- 1. Nueva columna «origen» y traspaso de lo que ya estaba guardado
alter table public.especies_propuestas
  add column if not exists origen text check (origen in ('nativa', 'endemica', 'exotica'));

update public.especies_propuestas
   set origen = case when endemica then 'endemica' else 'nativa' end
 where origen is null and endemica is not null;

grant insert (origen) on public.especies_propuestas to authenticated;

-- 2. «No evaluado» como estado de conservación válido
alter table public.especies_propuestas
  drop constraint if exists especies_propuestas_estado_conservacion_check;
alter table public.especies_propuestas
  add constraint especies_propuestas_estado_conservacion_check
  check (estado_conservacion in ('No evaluado', 'Preocupación menor', 'Casi amenazada', 'Vulnerable',
                                 'En peligro', 'En peligro crítico', 'Extinta en estado silvestre'));

-- 3. La moderación también puede corregir el origen (y «endémica» se mantiene coherente)
create or replace function public.moderar_especie(p_id bigint, p_estado text, p_motivo text default null, p_cambios jsonb default null)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo el administrador puede moderar.'; end if;
  if p_estado not in ('aprobada', 'rechazada', 'pendiente') then raise exception 'Estado inválido'; end if;
  update public.especies_propuestas set
    nombre              = coalesce(p_cambios->>'nombre', nombre),
    cientifico          = coalesce(p_cambios->>'cientifico', cientifico),
    descripcion         = coalesce(p_cambios->>'descripcion', descripcion),
    tipo                = coalesce(p_cambios->>'tipo', tipo),
    grupo               = case when p_cambios ? 'grupo' then nullif(p_cambios->>'grupo', '') else grupo end,
    estado_conservacion = case when p_cambios ? 'estado_conservacion'
                               then nullif(p_cambios->>'estado_conservacion', '') else estado_conservacion end,
    origen              = case when p_cambios ? 'origen' then nullif(p_cambios->>'origen', '') else origen end,
    estado = p_estado, motivo_rechazo = p_motivo, revisado = now()
  where id = p_id;
  -- «endemica» se deduce del origen, para las páginas que aún la usan
  update public.especies_propuestas
     set endemica = case origen when 'endemica' then true when 'nativa' then false when 'exotica' then false else null end
   where id = p_id;
end $$;

revoke execute on function public.moderar_especie from public, anon;
grant execute on function public.moderar_especie to authenticated;

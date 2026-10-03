-- =========================================================
--  Lumaria — Especies propuestas por la comunidad
--  Personas registradas proponen especies que faltan en el atlas.
--  Solo se publican en la región cuando la administración las aprueba.
--  Pégalo en Supabase → SQL Editor → Run (una sola vez).
-- =========================================================

create table public.especies_propuestas (
  id                  bigint generated always as identity primary key,
  usuario_id          uuid not null default auth.uid() references public.perfiles on delete cascade,
  region              text not null check (public.region_valida(region)),
  tipo                text not null check (tipo in ('flora', 'fauna', 'fungi')),
  grupo               text check (grupo in ('Hongo', 'Liquen')),
  nombre              text not null check (char_length(nombre) between 2 and 60),
  cientifico          text not null check (char_length(cientifico) between 3 and 80),
  descripcion         text not null check (char_length(descripcion) between 20 and 300),
  estado_conservacion text check (estado_conservacion in ('Preocupación menor', 'Casi amenazada', 'Vulnerable',
                                  'En peligro', 'En peligro crítico', 'Extinta en estado silvestre')),
  endemica            boolean,
  fuente              text check (char_length(fuente) <= 300),
  ruta_foto           text not null unique,
  lugar_foto          text check (char_length(lugar_foto) <= 120),
  estado              text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  motivo_rechazo      text,
  creado              timestamptz not null default now(),
  revisado            timestamptz
);
create index especies_propuestas_region on public.especies_propuestas (region, estado);

-- Qué puede hacer el público (las filas visibles las deciden las reglas de abajo)
grant select on public.especies_propuestas to anon, authenticated;
revoke insert, update, delete on public.especies_propuestas from anon, authenticated;
grant insert (region, tipo, grupo, nombre, cientifico, descripcion, estado_conservacion, endemica,
              fuente, ruta_foto, lugar_foto) on public.especies_propuestas to authenticated;
grant delete on public.especies_propuestas to authenticated;

alter table public.especies_propuestas enable row level security;

-- Todos ven las aprobadas; cada autor ve las suyas (y su estado); el admin ve todo
create policy "ver especies propuestas" on public.especies_propuestas for select
  using (estado = 'aprobada' or usuario_id = auth.uid() or public.es_admin());
create policy "proponer especies" on public.especies_propuestas for insert to authenticated
  with check (usuario_id = auth.uid() and public.puede_publicar());
create policy "retirar especies propuestas" on public.especies_propuestas for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

-- Máximo 10 propuestas esperando revisión por persona
create function public.limitar_propuestas() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.especies_propuestas
       where usuario_id = new.usuario_id and estado = 'pendiente') >= 10 then
    raise exception 'Tienes 10 especies esperando revisión. Espera a que se revisen antes de proponer más.';
  end if;
  return new;
end $$;

create trigger limite_propuestas before insert on public.especies_propuestas
  for each row execute function public.limitar_propuestas();

-- El administrador aprueba o rechaza, y puede corregir los textos al aprobar
create function public.moderar_especie(p_id bigint, p_estado text, p_motivo text default null, p_cambios jsonb default null)
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
    endemica            = case when p_cambios ? 'endemica'
                               then (p_cambios->>'endemica')::boolean else endemica end,
    estado = p_estado, motivo_rechazo = p_motivo, revisado = now()
  where id = p_id;
end $$;

revoke execute on function public.moderar_especie from public, anon;
grant execute on function public.moderar_especie to authenticated;

-- Fotos de las especies propuestas: privadas hasta que la especie se aprueba
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('especies', 'especies', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "subir fotos de especies" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'especies'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.puede_publicar()
  );

create policy "ver fotos de especies aprobadas" on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'especies' and (
      (storage.foldername(storage.objects.name))[1] = auth.uid()::text
      or public.es_admin()
      or exists (select 1 from public.especies_propuestas p
                 where p.ruta_foto = storage.objects.name and p.estado = 'aprobada')
    )
  );

create policy "borrar fotos de especies" on storage.objects for delete to authenticated
  using (
    bucket_id = 'especies'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin())
  );

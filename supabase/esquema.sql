-- =========================================================
--  Lumaria — Comunidad (Supabase / PostgreSQL)
--  Pega TODO este archivo en Supabase → SQL Editor → Run.
--  Se puede ejecutar una sola vez sobre un proyecto nuevo.
--  Después, ejecutar también los archivos de supabase/migraciones/ en orden de fecha,
--  salvo 2026-10-03-tipo-de-foto.sql, que ya está incluido aquí.
-- =========================================================

-- ---------- Perfiles ----------
create table public.perfiles (
  id         uuid primary key references auth.users on delete cascade,
  nombre     text not null check (char_length(nombre) between 2 and 40),
  rol        text not null default 'usuario' check (rol in ('usuario', 'admin')),
  bloqueado  boolean not null default false,
  creado     timestamptz not null default now()
);

-- Al registrarse alguien, se le crea un perfil con un nombre provisorio
create function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, 'Explorador ' || upper(substr(new.id::text, 1, 4)));
  return new;
end $$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

create function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

create function public.puede_publicar() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and not bloqueado);
$$;

-- ---------- Regiones válidas ----------
create function public.region_valida(r text) returns boolean
language sql immutable as $$
  select r in ('arica','tarapaca','antofagasta','atacama','coquimbo','valparaiso','metropolitana',
               'ohiggins','maule','nuble','biobio','araucania','losrios','loslagos','aysen','magallanes');
$$;

-- ---------- Fotos ----------
create table public.fotos (
  id                 bigint generated always as identity primary key,
  usuario_id         uuid not null default auth.uid() references public.perfiles on delete cascade,
  region             text not null check (public.region_valida(region)),
  tipo               text check (tipo in ('flora', 'fauna', 'fungi')),
  especie_cientifico text check (char_length(especie_cientifico) <= 80),
  especie_nombre     text not null check (char_length(especie_nombre) between 2 and 80),
  lugar              text not null check (char_length(lugar) between 2 and 120),
  lat                double precision check (lat between -90 and 90),
  lng                double precision check (lng between -180 and 180),
  fecha_foto         date,
  descripcion        text check (char_length(descripcion) <= 1000),
  ruta               text not null unique,
  estado             text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  motivo_rechazo     text,
  creado             timestamptz not null default now(),
  revisado           timestamptz
);
create index fotos_region_estado on public.fotos (region, estado, creado desc);

-- ---------- Debates ----------
create table public.hilos (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null default auth.uid() references public.perfiles on delete cascade,
  region      text not null check (public.region_valida(region)),
  titulo      text not null check (char_length(titulo) between 4 and 120),
  cuerpo      text not null check (char_length(cuerpo) between 1 and 4000),
  oculto      boolean not null default false,
  creado      timestamptz not null default now()
);
create index hilos_region on public.hilos (region, creado desc);

-- ---------- Comentarios (en una foto o en un debate) ----------
create table public.comentarios (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null default auth.uid() references public.perfiles on delete cascade,
  foto_id     bigint references public.fotos on delete cascade,
  hilo_id     bigint references public.hilos on delete cascade,
  cuerpo      text not null check (char_length(cuerpo) between 1 and 2000),
  oculto      boolean not null default false,
  creado      timestamptz not null default now(),
  check ((foto_id is null) <> (hilo_id is null))
);
create index comentarios_foto on public.comentarios (foto_id, creado);
create index comentarios_hilo on public.comentarios (hilo_id, creado);

-- ---------- Reportes ----------
create table public.reportes (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null default auth.uid() references public.perfiles on delete cascade,
  tipo        text not null check (tipo in ('foto', 'hilo', 'comentario')),
  objeto_id   bigint not null,
  motivo      text check (char_length(motivo) <= 300),
  resuelto    boolean not null default false,
  creado      timestamptz not null default now(),
  unique (usuario_id, tipo, objeto_id)
);

-- =========================================================
--  Permisos por columna: lo que el público puede escribir
-- =========================================================
-- Lectura explícita (por si el proyecto se creó sin exponer las tablas automáticamente).
-- Qué filas ve cada uno lo deciden las reglas RLS de más abajo.
grant usage on schema public to anon, authenticated;
grant select on public.perfiles, public.fotos, public.hilos, public.comentarios to anon, authenticated;
grant select on public.reportes to authenticated;
grant execute on function public.es_admin, public.puede_publicar, public.region_valida to anon, authenticated;

revoke insert, update, delete on public.perfiles, public.fotos, public.hilos, public.comentarios, public.reportes
  from anon, authenticated;

grant update (nombre) on public.perfiles to authenticated;
grant insert (region, tipo, especie_cientifico, especie_nombre, lugar, lat, lng, fecha_foto, descripcion, ruta)
  on public.fotos to authenticated;
grant delete on public.fotos to authenticated;
grant insert (region, titulo, cuerpo) on public.hilos to authenticated;
grant delete on public.hilos to authenticated;
grant insert (foto_id, hilo_id, cuerpo) on public.comentarios to authenticated;
grant delete on public.comentarios to authenticated;
grant insert (tipo, objeto_id, motivo) on public.reportes to authenticated;
grant update (resuelto) on public.reportes to authenticated;

-- =========================================================
--  Seguridad por fila (RLS)
-- =========================================================
alter table public.perfiles    enable row level security;
alter table public.fotos       enable row level security;
alter table public.hilos       enable row level security;
alter table public.comentarios enable row level security;
alter table public.reportes    enable row level security;

-- Perfiles: nombres visibles para todos; cada uno edita solo su nombre
create policy "perfiles visibles" on public.perfiles for select using (true);
create policy "editar mi perfil" on public.perfiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Fotos: el público solo ve las aprobadas; cada autor ve las suyas; el admin ve todo
create policy "ver fotos" on public.fotos for select
  using (estado = 'aprobada' or usuario_id = auth.uid() or public.es_admin());
create policy "subir fotos" on public.fotos for insert to authenticated
  with check (usuario_id = auth.uid() and public.puede_publicar());
create policy "borrar fotos" on public.fotos for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

-- Debates
create policy "ver debates" on public.hilos for select
  using (not oculto or usuario_id = auth.uid() or public.es_admin());
create policy "crear debates" on public.hilos for insert to authenticated
  with check (usuario_id = auth.uid() and public.puede_publicar());
create policy "borrar debates" on public.hilos for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

-- Comentarios: solo en fotos aprobadas o debates visibles
create policy "ver comentarios" on public.comentarios for select
  using (not oculto or usuario_id = auth.uid() or public.es_admin());
create policy "comentar" on public.comentarios for insert to authenticated
  with check (
    usuario_id = auth.uid() and public.puede_publicar()
    and (foto_id is null or exists (select 1 from public.fotos f where f.id = foto_id and f.estado = 'aprobada'))
    and (hilo_id is null or exists (select 1 from public.hilos h where h.id = hilo_id and not h.oculto))
  );
create policy "borrar comentarios" on public.comentarios for delete to authenticated
  using (usuario_id = auth.uid() or public.es_admin());

-- Reportes: cualquiera con cuenta reporta; solo el admin los ve y resuelve
create policy "reportar" on public.reportes for insert to authenticated
  with check (usuario_id = auth.uid());
create policy "admin ve reportes" on public.reportes for select to authenticated
  using (public.es_admin());
create policy "admin resuelve reportes" on public.reportes for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- =========================================================
--  Límites anti-spam
-- =========================================================
create function public.limitar_publicaciones() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'fotos' then
    if (select count(*) from public.fotos where usuario_id = new.usuario_id and estado = 'pendiente') >= 10 then
      raise exception 'Tienes 10 fotos esperando revisión. Espera a que se revisen antes de subir más.';
    end if;
  elsif tg_table_name = 'hilos' then
    if (select count(*) from public.hilos where usuario_id = new.usuario_id and creado > now() - interval '1 day') >= 10 then
      raise exception 'Has creado muchos debates hoy. Intenta mañana.';
    end if;
  elsif tg_table_name = 'comentarios' then
    if (select count(*) from public.comentarios where usuario_id = new.usuario_id and creado > now() - interval '1 hour') >= 30 then
      raise exception 'Estás comentando muy rápido. Espera un momento.';
    end if;
  end if;
  return new;
end $$;

create trigger limite_fotos before insert on public.fotos for each row execute function public.limitar_publicaciones();
create trigger limite_hilos before insert on public.hilos for each row execute function public.limitar_publicaciones();
create trigger limite_comentarios before insert on public.comentarios for each row execute function public.limitar_publicaciones();

-- Con 3 reportes de personas distintas, el contenido se oculta solo hasta que el admin lo revise
create function public.ocultar_por_reportes() returns trigger
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  select count(*) into n from public.reportes
   where tipo = new.tipo and objeto_id = new.objeto_id and not resuelto;
  if n >= 3 then
    if new.tipo = 'hilo' then update public.hilos set oculto = true where id = new.objeto_id;
    elsif new.tipo = 'comentario' then update public.comentarios set oculto = true where id = new.objeto_id;
    elsif new.tipo = 'foto' then update public.fotos set estado = 'pendiente' where id = new.objeto_id;
    end if;
  end if;
  return new;
end $$;

create trigger al_reportar after insert on public.reportes
  for each row execute function public.ocultar_por_reportes();

-- =========================================================
--  Acciones del administrador
-- =========================================================
create function public.moderar_foto(p_id bigint, p_estado text, p_motivo text default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo el administrador puede moderar.'; end if;
  if p_estado not in ('aprobada', 'rechazada', 'pendiente') then raise exception 'Estado inválido'; end if;
  update public.fotos set estado = p_estado, motivo_rechazo = p_motivo, revisado = now() where id = p_id;
  update public.reportes set resuelto = true where tipo = 'foto' and objeto_id = p_id;
end $$;

create function public.ocultar_contenido(p_tipo text, p_id bigint, p_oculto boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo el administrador puede moderar.'; end if;
  if p_tipo = 'hilo' then update public.hilos set oculto = p_oculto where id = p_id;
  elsif p_tipo = 'comentario' then update public.comentarios set oculto = p_oculto where id = p_id;
  else raise exception 'Tipo inválido';
  end if;
  update public.reportes set resuelto = true where tipo = p_tipo and objeto_id = p_id;
end $$;

create function public.bloquear_usuario(p_id uuid, p_bloqueado boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo el administrador puede bloquear.'; end if;
  if p_id = auth.uid() then raise exception 'No puedes bloquearte a ti mismo.'; end if;
  update public.perfiles set bloqueado = p_bloqueado where id = p_id;
end $$;

revoke execute on function public.moderar_foto, public.ocultar_contenido, public.bloquear_usuario from public, anon;
grant execute on function public.moderar_foto, public.ocultar_contenido, public.bloquear_usuario to authenticated;

-- =========================================================
--  Almacenamiento de fotos (privado: solo se sirven las aprobadas)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "subir mis fotos" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.puede_publicar()
  );

create policy "ver fotos aprobadas" on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'fotos' and (
      (storage.foldername(storage.objects.name))[1] = auth.uid()::text
      or public.es_admin()
      or exists (select 1 from public.fotos f where f.ruta = storage.objects.name and f.estado = 'aprobada')
    )
  );

create policy "borrar mis fotos" on storage.objects for delete to authenticated
  using (
    bucket_id = 'fotos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin())
  );

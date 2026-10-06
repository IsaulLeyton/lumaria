-- =========================================================
--  Lumaria — Refuerzos de seguridad (auditoría del 5 de octubre de 2026)
--  Pégalo en Supabase → SQL Editor → Run (una sola vez).
-- =========================================================

-- ---------------------------------------------------------
-- 1. Reportes: límite por persona y protección contra cuentas falsas
--    Antes: sin límite, y 3 reportes de cualquier cuenta ocultaban contenido.
--    Ahora: máximo 20 reportes al día por persona, y para ocultar algo
--    automáticamente solo cuentan cuentas con más de 1 día de antigüedad.
-- ---------------------------------------------------------
create or replace function public.limitar_reportes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.reportes
       where usuario_id = new.usuario_id and creado > now() - interval '1 day') >= 20 then
    raise exception 'Has enviado muchos reportes hoy. La moderación ya los está revisando.';
  end if;
  return new;
end $$;

drop trigger if exists limite_reportes on public.reportes;
create trigger limite_reportes before insert on public.reportes
  for each row execute function public.limitar_reportes();

create or replace function public.ocultar_por_reportes() returns trigger
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  select count(*) into n
    from public.reportes r
    join public.perfiles p on p.id = r.usuario_id
   where r.tipo = new.tipo and r.objeto_id = new.objeto_id and not r.resuelto
     and p.creado < now() - interval '1 day' and not p.bloqueado;
  if n >= 3 then
    if new.tipo = 'hilo' then update public.hilos set oculto = true where id = new.objeto_id;
    elsif new.tipo = 'comentario' then update public.comentarios set oculto = true where id = new.objeto_id;
    elsif new.tipo = 'foto' then update public.fotos set estado = 'pendiente' where id = new.objeto_id;
    end if;
  end if;
  return new;
end $$;

-- ---------------------------------------------------------
-- 2. Perfiles: el público solo ve el nombre (ya no quién es admin o quién está bloqueado)
-- ---------------------------------------------------------
revoke select on public.perfiles from anon, authenticated;
grant select (id, nombre, creado) on public.perfiles to anon, authenticated;

-- Cada persona puede leer su propio perfil completo (para saber si es admin o está bloqueada)
create or replace function public.mi_perfil()
returns table (id uuid, nombre text, rol text, bloqueado boolean, creado timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.id, p.nombre, p.rol, p.bloqueado, p.creado from public.perfiles p where p.id = auth.uid();
$$;
revoke execute on function public.mi_perfil from public, anon;
grant execute on function public.mi_perfil to authenticated;

-- La lista de cuentas bloqueadas, solo para el admin
create or replace function public.usuarios_bloqueados()
returns table (id uuid, nombre text, creado timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo el administrador puede ver esto.'; end if;
  return query select p.id, p.nombre, p.creado from public.perfiles p where p.bloqueado order by p.nombre;
end $$;
revoke execute on function public.usuarios_bloqueados from public, anon;
grant execute on function public.usuarios_bloqueados to authenticated;

-- ---------------------------------------------------------
-- 3. Nombres reservados: nadie (salvo el admin) puede llamarse «Lumaria», «Moderación» o «Admin»
-- ---------------------------------------------------------
create or replace function public.revisar_nombre() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.nombre is distinct from old.nombre
     and new.nombre ~* '(lumaria|moderaci|moderador|administra|\madmin)'
     and not public.es_admin() then
    raise exception 'Ese nombre está reservado para la moderación de Lumaria. Elige otro.';
  end if;
  return new;
end $$;

drop trigger if exists nombre_reservado on public.perfiles;
create trigger nombre_reservado before update on public.perfiles
  for each row execute function public.revisar_nombre();

-- ---------------------------------------------------------
-- 4. Fotos: cada registro solo puede apuntar a un archivo de la carpeta de su autor
-- ---------------------------------------------------------
drop policy if exists "subir fotos" on public.fotos;
create policy "subir fotos" on public.fotos for insert to authenticated
  with check (
    usuario_id = auth.uid() and public.puede_publicar()
    and split_part(ruta, '/', 1) = auth.uid()::text
  );

drop policy if exists "proponer especies" on public.especies_propuestas;
create policy "proponer especies" on public.especies_propuestas for insert to authenticated
  with check (
    usuario_id = auth.uid() and public.puede_publicar()
    and split_part(ruta_foto, '/', 1) = auth.uid()::text
  );

-- ============================================================================
--  Tienda S&K — Políticas de seguridad de la base de datos
--
--  QUÉ ARREGLA (comprobado el 2026-09-04 con la llave pública de la tienda,
--  la misma que viaja en el navegador de cualquier visitante):
--
--    1. Cualquiera podía LEER la tabla `orders`: nombre, correo, dirección,
--       teléfono, qué compró cada cliente y cuánto pagó.
--    2. Cualquiera podía INSERTAR pedidos y marcarlos como "paid".
--    3. Cualquiera podía LEER todos los cupones, incluso los que aún no has
--       lanzado o tienes desactivados.
--
--  CÓMO APLICARLO
--    Supabase → SQL Editor → New query → pega todo esto → Run.
--    Es idempotente: puedes ejecutarlo las veces que quieras.
--
--  QUÉ NO TOCA
--    Las políticas de `products`, que ya estaban bien: desde fuera no se puede
--    crear, modificar ni borrar ningún producto, y los borradores no se ven.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
--  1. Quién es administrador
--
--  Se decide aquí, en la base de datos, y no en el navegador. En el navegador
--  la lista de correos solo sirve para mostrar u ocultar botones: cualquiera
--  puede saltarse eso desde la consola. Esto no.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'pneisonestiven@gmail.com',
      'syktiendaenlinea@gmail.com'
    ),
    false
  );
$$;

comment on function public.es_admin() is
  'Administradores de Tienda S&K. Para añadir a alguien, edita esta lista y vuelve a ejecutar la función.';


-- ────────────────────────────────────────────────────────────────────────────
--  2. PEDIDOS (orders)
--
--  Regla: un cliente solo ve SUS pedidos. El administrador los ve todos.
--  Nadie los crea ni los modifica desde el navegador: eso lo hace el servidor
--  con la llave secreta (`service_role`), que no pasa por estas reglas.
-- ────────────────────────────────────────────────────────────────────────────

-- Dónde se guarda el cupón aplicado. El servidor ya calcula el descuento al
-- cobrar; estas dos columnas dejan constancia de con qué cupón se hizo.
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_amount integer default 0;

alter table public.orders enable row level security;

-- Fuera cualquier política antigua de esta tabla, se llame como se llame.
do $$
declare politica record;
begin
  for politica in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'orders'
  loop
    execute format('drop policy %I on public.orders', politica.policyname);
  end loop;
end $$;

-- Leer: solo tus propios pedidos.
create policy "el cliente ve sus pedidos"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid());

-- Leer todo: solo el administrador.
create policy "el administrador ve todos los pedidos"
  on public.orders for select
  to authenticated
  using (public.es_admin());

-- Nadie inserta, actualiza ni borra desde el navegador. Al no existir política
-- para esas operaciones, quedan denegadas: en Postgres, lo que no se permite
-- explícitamente está prohibido.


-- ────────────────────────────────────────────────────────────────────────────
--  3. CUPONES (coupons)
--
--  Los códigos dejan de ser públicos. La tienda ya no los lee desde el
--  navegador: ahora el servidor valida el cupón al pagar (`/api/checkout`),
--  que es además donde se aplica el descuento de verdad.
-- ────────────────────────────────────────────────────────────────────────────

alter table public.coupons enable row level security;

do $$
declare politica record;
begin
  for politica in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'coupons'
  loop
    execute format('drop policy %I on public.coupons', politica.policyname);
  end loop;
end $$;

-- Solo el administrador ve y gestiona los cupones, desde su panel.
create policy "el administrador gestiona los cupones"
  on public.coupons for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());


-- ────────────────────────────────────────────────────────────────────────────
--  4. IMÁGENES (storage.objects, bucket product-images)
--
--  Un desconocido podía ENUMERAR el contenido del bucket. Las fotos siguen
--  viéndose igual —un bucket público las sirve por su URL sin pasar por estas
--  reglas—, pero ya no se puede pedir la lista de lo que hay dentro.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare politica record;
begin
  for politica in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like '%product-images%'
  loop
    execute format('drop policy %I on storage.objects', politica.policyname);
  end loop;
end $$;

-- Solo el administrador puede listar, subir, reemplazar y borrar imágenes.
create policy "product-images: el administrador gestiona los archivos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'product-images' and public.es_admin())
  with check (bucket_id = 'product-images' and public.es_admin());


-- ────────────────────────────────────────────────────────────────────────────
--  5. Comprobación
--
--  Al terminar deberías ver una fila por cada política de la lista de abajo.
-- ────────────────────────────────────────────────────────────────────────────

select schemaname, tablename, policyname, cmd, roles
from pg_policies
where (schemaname = 'public' and tablename in ('orders', 'coupons', 'products'))
   or (schemaname = 'storage' and policyname like '%product-images%')
order by tablename, policyname;

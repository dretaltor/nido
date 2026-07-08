-- Smoke test de políticas RLS críticas.
-- Objetivo: atrapar recursión infinita u otros errores de política ANTES de que lleguen
-- a producción (este script existe porque un cambio de RLS en la tabla `admins` bloqueó
-- el acceso al admin en julio 2026 — ver auditoría del 7 jul 2026).
--
-- Uso local:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/rls-smoke-test.sql
--
-- Simula una consulta autenticada normal (no service_role, que ignora RLS) contra las
-- tablas que tienen políticas de tipo "admin puede ver todo". Si alguna política quedó
-- mal escrita (p. ej. una tabla consultándose a sí misma dentro de su propia política),
-- Postgres lanza "infinite recursion detected in policy for relation X" y el script falla.

begin;

set local role authenticated;
set local "request.jwt.claims" to '{"email":"dretalva@gmail.com","role":"authenticated"}';

select 1 from public.admins limit 1;
select 1 from public.perfiles limit 1;
select 1 from public.propietarios limit 1;
select 1 from public.propiedades limit 1;
select 1 from public.contratos limit 1;
select 1 from public.admin_audit_log limit 1;

select 'RLS smoke test OK — sin recursión detectada' as resultado;

rollback;

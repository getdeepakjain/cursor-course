-- If you already ran the first migration before grants existed, run this once in the SQL editor.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.api_keys to service_role;

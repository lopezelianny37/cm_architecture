-- "Cargar información" (import) now always appends instead of replacing the
-- user's existing records (see import-export.service.ts). A re-imported or
-- single-architect backup can legitimately share an architect_name with an
-- existing record, so the DB-level uniqueness that used to be safe only
-- because import wiped the table first no longer holds.
--
-- Duplicate-name prevention for the manual create/rename flows (Home.tsx's
-- "+ Nuevo arquitecto", FormView.tsx's architect name field) is preserved —
-- just moved to an application-level check in RecordsService, since the DB
-- constraint can no longer discriminate between "manual create" (still
-- blocked) and "import" (now allowed).
ALTER TABLE public.gemba_records
  DROP CONSTRAINT gemba_records_user_id_architect_name_key;

-- Adds a free-text "Estado de la iniciativa" field to gemba_records.
-- No fixed options yet (explicitly requested as plain text for now).

ALTER TABLE public.gemba_records
  ADD COLUMN initiative_status TEXT;
-- Nullable: existing records predate this field.

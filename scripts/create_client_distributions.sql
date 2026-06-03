-- Create the dedicated client distributions table for uitgiftegeschiedenis.
CREATE TABLE IF NOT EXISTS public.client_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  item text NOT NULL,
  note text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: if you use Row Level Security, enable it and add policies separately.
-- Example:
-- ALTER TABLE public.client_distributions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated read" ON public.client_distributions
--   FOR SELECT USING (auth.uid() IS NOT NULL);

-- Optional migration from old [UITGIFTE] notes in clients.notes.
-- Test this query first before uncommenting the final INSERT.

-- WITH raw_lines AS (
--   SELECT id AS client_id,
--          unnest(string_to_array(notes, '\n')) AS line
--   FROM public.clients
--   WHERE notes ILIKE '[UITGIFTE]%'
-- ),
-- parsed AS (
--   SELECT
--     client_id,
--     trim((regexp_matches(line, '^\[UITGIFTE\]\s*([0-9-/]+)\s*-\s*([^\-\n]+)\s*-\s*(.+)$'))[1]) AS date_text,
--     trim((regexp_matches(line, '^\[UITGIFTE\]\s*([0-9-/]+)\s*-\s*([^\-\n]+)\s*-\s*(.+)$'))[2]) AS item,
--     trim((regexp_matches(line, '^\[UITGIFTE\]\s*([0-9-/]+)\s*-\s*([^\-\n]+)\s*-\s*(.+)$'))[3]) AS note
--   FROM raw_lines
-- )
-- INSERT INTO public.client_distributions (client_id, date, item, note)
-- SELECT client_id,
--        nullif(date_text, '')::date,
--        item,
--        note
-- FROM parsed;

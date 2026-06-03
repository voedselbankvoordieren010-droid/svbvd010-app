-- Enable Row Level Security for client_distributions
ALTER TABLE public.client_distributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they already exist so this script can be rerun safely.
DROP POLICY IF EXISTS "Staff can select client_distributions" ON public.client_distributions;
DROP POLICY IF EXISTS "Staff can insert client_distributions" ON public.client_distributions;
DROP POLICY IF EXISTS "Creator or admin can update client_distributions" ON public.client_distributions;
DROP POLICY IF EXISTS "Creator or admin can delete client_distributions" ON public.client_distributions;

-- Only allow authenticated staff to read distribution data.
CREATE POLICY "Staff can select client_distributions"
  ON public.client_distributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'hulpverlener', 'vrijwilliger')
    )
  );

-- Allow staff to insert distributions only if they are the creator.
CREATE POLICY "Staff can insert client_distributions"
  ON public.client_distributions
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'hulpverlener', 'vrijwilliger')
    )
  );

-- Allow the creator or an admin to update distribution entries.
CREATE POLICY "Creator or admin can update client_distributions"
  ON public.client_distributions
  FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Allow the creator or an admin to delete distribution entries.
CREATE POLICY "Creator or admin can delete client_distributions"
  ON public.client_distributions
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Note: this uses the app's profile roles and avoids auth.role().
-- The app currently recognizes: admin, hulpverlener, vrijwilliger, intake, client.
-- Only admin/hulpverlener/vrijwilliger are allowed to work with distributions.

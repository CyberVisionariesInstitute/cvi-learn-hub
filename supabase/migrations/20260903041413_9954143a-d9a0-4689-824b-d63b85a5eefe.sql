CREATE TABLE public.defense_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id),
  scheduled_at timestamptz,
  presentation_notes text NOT NULL DEFAULT '',
  panel_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_points integer NOT NULL DEFAULT 0,
  max_points integer NOT NULL DEFAULT 0,
  outcome text NOT NULL DEFAULT 'pending',
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.defense_records TO authenticated;
GRANT ALL ON public.defense_records TO service_role;

ALTER TABLE public.defense_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY defense_records_staff_only ON public.defense_records
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER defense_records_touch
  BEFORE UPDATE ON public.defense_records
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
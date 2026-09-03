CREATE TABLE public.stage_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL,
  stage_group TEXT NOT NULL CHECK (stage_group IN ('stage1','stage2','stage3','stage4','overall')),
  mark TEXT NOT NULL DEFAULT 'on_track' CHECK (mark IN ('strong','on_track','needs_work','blocked')),
  body TEXT NOT NULL DEFAULT '',
  reviewer_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, stage_group)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stage_feedback TO authenticated;
GRANT ALL ON public.stage_feedback TO service_role;

ALTER TABLE public.stage_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stage_feedback_select_own_or_staff" ON public.stage_feedback
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "stage_feedback_staff_write" ON public.stage_feedback
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER stage_feedback_updated_at
  BEFORE UPDATE ON public.stage_feedback
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
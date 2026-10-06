CREATE TABLE public.w12_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  source_w11_attempt_id uuid REFERENCES public.w11_attempts(id),
  source_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_snapshot_hash text NOT NULL DEFAULT '',
  source_text_revision integer NOT NULL DEFAULT 0,
  source_state_revision integer NOT NULL DEFAULT 0,
  source_captured_at timestamptz NOT NULL DEFAULT now(),
  exec_option text NOT NULL DEFAULT '' CHECK (exec_option IN ('','written','video')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  text_revision integer NOT NULL DEFAULT 0,
  volunteer_status text NOT NULL DEFAULT 'none' CHECK (volunteer_status IN ('none','volunteered','withdrawn')),
  presenter_selected boolean NOT NULL DEFAULT false,
  presenter_selected_by uuid,
  presenter_selected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX w12_one_active_attempt ON public.w12_attempts(owner_user_id) WHERE status = 'active';
GRANT SELECT ON public.w12_attempts TO authenticated;
GRANT ALL ON public.w12_attempts TO service_role;
ALTER TABLE public.w12_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "w12 owners read own attempts" ON public.w12_attempts FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "w12 staff read attempts" ON public.w12_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER w12_attempts_touch BEFORE UPDATE ON public.w12_attempts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.w12_presenter_limit() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.presenter_selected AND NOT COALESCE(OLD.presenter_selected, false) THEN
    PERFORM pg_advisory_xact_lock(hashtext('w12_presenter_limit'));
    IF (SELECT count(*) FROM public.w12_attempts WHERE presenter_selected AND id <> NEW.id) >= 2 THEN
      RAISE EXCEPTION 'PRESENTER_LIMIT';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER w12_presenter_limit BEFORE INSERT OR UPDATE ON public.w12_attempts FOR EACH ROW EXECUTE FUNCTION public.w12_presenter_limit();

CREATE TABLE public.w12_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.w12_attempts(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback text NOT NULL DEFAULT '',
  text_revision integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.w12_reviews TO authenticated;
GRANT ALL ON public.w12_reviews TO service_role;
ALTER TABLE public.w12_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "w12 owners read own reviews" ON public.w12_reviews FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.w12_attempts a WHERE a.id = attempt_id AND a.owner_user_id = auth.uid()));
CREATE POLICY "w12 staff read reviews" ON public.w12_reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'admin'));
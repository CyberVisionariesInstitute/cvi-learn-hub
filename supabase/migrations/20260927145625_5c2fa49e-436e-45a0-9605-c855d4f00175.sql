CREATE TABLE public.w11_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_label text,
  seed_version text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  state_revision integer NOT NULL DEFAULT 0,
  action_seq integer NOT NULL DEFAULT 0,
  state jsonb NOT NULL,
  learner jsonb NOT NULL DEFAULT '{}'::jsonb,
  text_revision integer NOT NULL DEFAULT 0,
  supersedes_attempt_id uuid REFERENCES public.w11_attempts(id),
  reset_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE UNIQUE INDEX w11_one_active_attempt ON public.w11_attempts(owner_user_id) WHERE status = 'active';
GRANT SELECT ON public.w11_attempts TO authenticated;
GRANT ALL ON public.w11_attempts TO service_role;
ALTER TABLE public.w11_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "w11 owners read own attempts" ON public.w11_attempts FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "w11 staff read attempts" ON public.w11_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.w11_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.w11_attempts(id) ON DELETE CASCADE,
  seq integer NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  action_type text NOT NULL,
  actor_kind text NOT NULL DEFAULT 'learner',
  actor_user_id uuid,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, idempotency_key)
);
GRANT SELECT ON public.w11_actions TO authenticated;
GRANT ALL ON public.w11_actions TO service_role;
ALTER TABLE public.w11_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "w11 owners read own actions" ON public.w11_actions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.w11_attempts a WHERE a.id = attempt_id AND a.owner_user_id = auth.uid()));
CREATE POLICY "w11 staff read actions" ON public.w11_actions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.w11_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.w11_attempts(id) ON DELETE CASCADE,
  evidence_key text NOT NULL,
  slot text NOT NULL,
  mission text NOT NULL,
  title text NOT NULL,
  snapshot jsonb NOT NULL,
  content_hash text NOT NULL,
  captured_revision integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, evidence_key)
);
GRANT SELECT ON public.w11_evidence TO authenticated;
GRANT ALL ON public.w11_evidence TO service_role;
ALTER TABLE public.w11_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "w11 owners read own evidence" ON public.w11_evidence FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.w11_attempts a WHERE a.id = attempt_id AND a.owner_user_id = auth.uid()));
CREATE POLICY "w11 staff read evidence" ON public.w11_evidence FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.w11_reset_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_attempt_id uuid NOT NULL REFERENCES public.w11_attempts(id),
  new_attempt_id uuid NOT NULL REFERENCES public.w11_attempts(id),
  owner_user_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  actor_kind text NOT NULL,
  reason text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.w11_reset_log TO service_role;
GRANT SELECT ON public.w11_reset_log TO authenticated;
ALTER TABLE public.w11_reset_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "w11 staff read reset log" ON public.w11_reset_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.w11_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.w11_attempts(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback text NOT NULL DEFAULT '',
  text_revision integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.w11_reviews TO service_role;
GRANT SELECT ON public.w11_reviews TO authenticated;
ALTER TABLE public.w11_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "w11 owners read own reviews" ON public.w11_reviews FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.w11_attempts a WHERE a.id = attempt_id AND a.owner_user_id = auth.uid()));
CREATE POLICY "w11 staff read reviews" ON public.w11_reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'instructor') OR public.has_role(auth.uid(),'admin'));

-- Atomic command commit: revision check + action append + state update in one transaction.
CREATE OR REPLACE FUNCTION public.w11_commit_command(
  p_attempt uuid, p_expected_revision integer, p_idem text, p_hash text, p_action_type text,
  p_new_state jsonb, p_new_seq integer, p_result jsonb, p_actor_kind text, p_actor uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row public.w11_attempts%ROWTYPE;
  v_prior public.w11_actions%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.w11_attempts WHERE id = p_attempt FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','NOT_FOUND'); END IF;
  SELECT * INTO v_prior FROM public.w11_actions WHERE attempt_id = p_attempt AND idempotency_key = p_idem;
  IF FOUND THEN
    IF v_prior.request_hash = p_hash THEN
      RETURN jsonb_build_object('replayed', true, 'result', v_prior.result, 'revision', v_row.state_revision);
    END IF;
    RETURN jsonb_build_object('error','IDEMPOTENCY_CONFLICT');
  END IF;
  IF v_row.status <> 'active' THEN RETURN jsonb_build_object('error','ARCHIVED'); END IF;
  IF v_row.state_revision <> p_expected_revision THEN
    RETURN jsonb_build_object('error','STATE_CHANGED','revision', v_row.state_revision);
  END IF;
  INSERT INTO public.w11_actions(attempt_id, seq, idempotency_key, request_hash, action_type, actor_kind, actor_user_id, result)
  VALUES (p_attempt, p_new_seq, p_idem, p_hash, p_action_type, p_actor_kind, p_actor, p_result);
  UPDATE public.w11_attempts SET state = p_new_state, state_revision = state_revision + 1,
    action_seq = p_new_seq, updated_at = now() WHERE id = p_attempt;
  RETURN jsonb_build_object('replayed', false, 'result', p_result, 'revision', v_row.state_revision + 1);
END; $$;
REVOKE ALL ON FUNCTION public.w11_commit_command(uuid,integer,text,text,text,jsonb,integer,jsonb,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.w11_commit_command(uuid,integer,text,text,text,jsonb,integer,jsonb,text,uuid) TO service_role;

-- Atomic reset: archive the active attempt and create a fresh one from the pinned seed.
CREATE OR REPLACE FUNCTION public.w11_reset_attempt(
  p_attempt uuid, p_expected_revision integer, p_idem text, p_seed_state jsonb,
  p_actor uuid, p_actor_kind text, p_reason text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row public.w11_attempts%ROWTYPE;
  v_log public.w11_reset_log%ROWTYPE;
  v_new uuid;
BEGIN
  SELECT * INTO v_log FROM public.w11_reset_log WHERE idempotency_key = p_idem;
  IF FOUND THEN RETURN jsonb_build_object('replayed', true, 'new_attempt_id', v_log.new_attempt_id); END IF;
  SELECT * INTO v_row FROM public.w11_attempts WHERE id = p_attempt FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','NOT_FOUND'); END IF;
  IF v_row.status <> 'active' THEN RETURN jsonb_build_object('error','ARCHIVED'); END IF;
  IF v_row.state_revision <> p_expected_revision THEN RETURN jsonb_build_object('error','STATE_CHANGED'); END IF;
  UPDATE public.w11_attempts SET status = 'archived', archived_at = now(), updated_at = now() WHERE id = p_attempt;
  INSERT INTO public.w11_attempts(owner_user_id, cohort_label, seed_version, state, learner, supersedes_attempt_id, reset_reason)
  VALUES (v_row.owner_user_id, v_row.cohort_label, v_row.seed_version, p_seed_state,
          jsonb_build_object('displayName', coalesce(v_row.learner->>'displayName','')), p_attempt, p_reason)
  RETURNING id INTO v_new;
  INSERT INTO public.w11_reset_log(old_attempt_id, new_attempt_id, owner_user_id, actor_user_id, actor_kind, reason, idempotency_key)
  VALUES (p_attempt, v_new, v_row.owner_user_id, p_actor, p_actor_kind, p_reason, p_idem);
  RETURN jsonb_build_object('replayed', false, 'new_attempt_id', v_new);
END; $$;
REVOKE ALL ON FUNCTION public.w11_reset_attempt(uuid,integer,text,jsonb,uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.w11_reset_attempt(uuid,integer,text,jsonb,uuid,text,text) TO service_role;
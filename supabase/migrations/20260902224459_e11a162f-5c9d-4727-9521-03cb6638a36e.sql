-- ============ roles ============
CREATE TYPE public.app_role AS ENUM ('student','instructor','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('instructor','admin'));
$$;

CREATE POLICY "profiles_select_self_or_staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select_self_or_staff" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- new users get a profile and the student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ scenario packages (instructor-private) ============
CREATE TABLE public.scenario_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  package jsonb NOT NULL DEFAULT '{}'::jsonb,
  calibration jsonb NOT NULL DEFAULT '{}'::jsonb,
  answer_guidance jsonb NOT NULL DEFAULT '{}'::jsonb,
  difficulty_score numeric,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenario_packages TO authenticated;
GRANT ALL ON public.scenario_packages TO service_role;
ALTER TABLE public.scenario_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scenario_packages_staff_only" ON public.scenario_packages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER scenario_packages_touch BEFORE UPDATE ON public.scenario_packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ assignments ============
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_package_id uuid NOT NULL REFERENCES public.scenario_packages(id) ON DELETE RESTRICT,
  scenario_code text NOT NULL,
  scenario_version text NOT NULL,
  state text NOT NULL DEFAULT 'active',
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX assignments_one_active_per_student
  ON public.assignments (user_id) WHERE state = 'active';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_select_own_or_staff" ON public.assignments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "assignments_staff_write" ON public.assignments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER assignments_touch BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.owns_assignment(_assignment_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = _assignment_id AND a.user_id = _user_id);
$$;

-- ============ student-safe scenario projection ============
CREATE TABLE public.scenario_student_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_package_id uuid NOT NULL REFERENCES public.scenario_packages(id) ON DELETE CASCADE,
  scenario_code text NOT NULL,
  scenario_version text NOT NULL,
  organization text NOT NULL,
  brief text NOT NULL,
  constraints jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  workloads jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scenario_code, scenario_version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenario_student_views TO authenticated;
GRANT ALL ON public.scenario_student_views TO service_role;
ALTER TABLE public.scenario_student_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scenario_views_assigned_student" ON public.scenario_student_views FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assignments a
    WHERE a.user_id = auth.uid()
      AND a.state = 'active'
      AND a.scenario_package_id = scenario_student_views.scenario_package_id
      AND a.scenario_version = scenario_student_views.scenario_version
  ));
CREATE POLICY "scenario_views_staff" ON public.scenario_student_views FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER scenario_views_touch BEFORE UPDATE ON public.scenario_student_views
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ projects ============
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES public.assignments(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_code text NOT NULL,
  scenario_version text NOT NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  revision integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_owner_select" ON public.projects FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "projects_owner_insert" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.owns_assignment(assignment_id, auth.uid()));
CREATE POLICY "projects_owner_update" ON public.projects FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.project_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revision integer NOT NULL,
  state jsonb NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, revision)
);
GRANT SELECT, INSERT ON public.project_revisions TO authenticated;
GRANT ALL ON public.project_revisions TO service_role;
ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "revisions_owner_select" ON public.project_revisions FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "revisions_owner_insert" ON public.project_revisions FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- ============ evidence ============
CREATE TABLE public.evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage text NOT NULL,
  week integer,
  title text NOT NULL,
  body text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_items TO authenticated;
GRANT ALL ON public.evidence_items TO service_role;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence_owner_select" ON public.evidence_items FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "evidence_owner_write" ON public.evidence_items FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- ============ checkpoints ============
CREATE TABLE public.checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week integer NOT NULL,
  stage text NOT NULL,
  student_state text NOT NULL DEFAULT 'in_progress',
  review_state text NOT NULL DEFAULT 'not_reviewed',
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes text,
  rubric jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, week)
);
GRANT SELECT, INSERT, UPDATE ON public.checkpoints TO authenticated;
GRANT ALL ON public.checkpoints TO service_role;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkpoints_owner_select" ON public.checkpoints FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "checkpoints_owner_write" ON public.checkpoints FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "checkpoints_staff_write" ON public.checkpoints FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER checkpoints_touch BEFORE UPDATE ON public.checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ hidden events ============
CREATE TABLE public.hidden_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  event_key text NOT NULL,
  title text NOT NULL,
  student_brief text NOT NULL,
  instructor_notes text,
  activated_at timestamptz,
  activated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, event_key)
);
GRANT SELECT, UPDATE ON public.hidden_events TO authenticated;
GRANT ALL ON public.hidden_events TO service_role;
ALTER TABLE public.hidden_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hidden_events_student_activated_only" ON public.hidden_events FOR SELECT TO authenticated
  USING (activated_at IS NOT NULL AND public.owns_assignment(assignment_id, auth.uid()));
CREATE POLICY "hidden_events_staff" ON public.hidden_events FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ submissions ============
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  defense_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  review_state text NOT NULL DEFAULT 'submitted',
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes text,
  rubric jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT, UPDATE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submissions_owner_select" ON public.submissions FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "submissions_owner_insert" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "submissions_staff_update" ON public.submissions FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ audit ============
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_staff_select" ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "audit_insert_self" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
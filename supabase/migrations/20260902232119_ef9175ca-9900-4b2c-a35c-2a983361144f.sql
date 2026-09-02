ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- Retire placeholder packages
DELETE FROM public.scenario_student_views
WHERE scenario_code IN ('meridian-health','northgate-pay','arcweld-industrial','lakemoor-university','cascade-utility','trellis-logistics','civic-services');

UPDATE public.scenario_packages
SET status = 'deprecated',
    calibration = '{}'::jsonb,
    answer_guidance = '{}'::jsonb,
    difficulty_score = NULL
WHERE code IN ('meridian-health','northgate-pay','arcweld-industrial','lakemoor-university','cascade-utility','trellis-logistics','civic-services');

-- Authoritative released registry (content is resolved server-side per code@version)
INSERT INTO public.scenario_packages (code, version, title, status, package, difficulty_score)
VALUES
 ('cedar-valley-health','1.0.0','Cedar Valley Health Network','released','{"content_source":"server-module","industry":"Healthcare"}'::jsonb,100),
 ('northstar-cloud','1.0.0','Northstar Cloud Software','released','{"content_source":"server-module","industry":"SaaS"}'::jsonb,101),
 ('meridian-trust-bank','1.0.0','Meridian Trust Bank','released','{"content_source":"server-module","industry":"Financial Services"}'::jsonb,100),
 ('sentinel-federal','1.0.0','Sentinel Federal Services','released','{"content_source":"server-module","industry":"Government Contractor"}'::jsonb,102),
 ('ironvale-manufacturing','1.0.0','IronVale Manufacturing','released','{"content_source":"server-module","industry":"Manufacturing"}'::jsonb,99),
 ('summit-state-university','1.0.0','Summit State University','released','{"content_source":"server-module","industry":"Higher Education"}'::jsonb,98),
 ('harborpoint-retail','1.0.0','HarborPoint Retail','released','{"content_source":"server-module","industry":"Retail / E-commerce"}'::jsonb,100)
ON CONFLICT (code, version) DO UPDATE
SET title = EXCLUDED.title,
    status = EXCLUDED.status,
    package = EXCLUDED.package,
    difficulty_score = EXCLUDED.difficulty_score;

-- Re-point the existing smoke-test assignment at a real released package and mark it test-only
UPDATE public.assignments a
SET is_test = true,
    scenario_package_id = p.id,
    scenario_code = p.code,
    scenario_version = p.version
FROM public.scenario_packages p
WHERE p.code = 'cedar-valley-health' AND p.version = '1.0.0';

UPDATE public.projects pr
SET scenario_code = a.scenario_code,
    scenario_version = a.scenario_version
FROM public.assignments a
WHERE pr.assignment_id = a.id;
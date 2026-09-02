ALTER TABLE public.checkpoints DROP CONSTRAINT IF EXISTS checkpoints_project_id_week_key;
ALTER TABLE public.checkpoints ADD CONSTRAINT checkpoints_project_stage_key UNIQUE (project_id, stage);
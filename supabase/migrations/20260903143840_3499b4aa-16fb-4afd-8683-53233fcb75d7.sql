UPDATE public.defense_records
SET scores = '{}'::jsonb,
    total_points = 0,
    max_points = 100,
    finalized_at = NULL,
    outcome = 'pending'
WHERE max_points IS DISTINCT FROM 100;

ALTER TABLE public.defense_records ALTER COLUMN max_points SET DEFAULT 100;
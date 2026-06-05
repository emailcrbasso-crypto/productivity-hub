# Supabase migrations

Each `.sql` file in `migrations/` is idempotent and safe to re-run.

## How to apply

1. Open Supabase Dashboard → **SQL Editor** → **New query**
2. Paste the content of the migration file (in order)
3. Click **Run**
4. Verify with: `select * from public.achievements;` (should return 10 rows after `0001`)

## Files

| File | Purpose |
|------|---------|
| `0001_hub_core.sql` | Hub-level tables: profiles, xp_events, achievements, user_achievements, trigger on_auth_user_created, RLS, seed |
| `0002_eisenhower.sql` | Eisenhower module: eisenhower_tasks (quadrant derived from is_urgent + is_important), RLS, xp_awarded anti-duplicate flag |

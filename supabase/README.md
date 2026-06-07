# Supabase Backend

## Migrations (apply in order)

1. `migrations/001_initial_schema.sql` — All tables (Section 8)
2. `migrations/002_rls_policies.sql` — Row Level Security (Section 11)
3. `migrations/003_seed_settings.sql` — Default platform settings

## Edge Functions

- `functions/game-move/` — Server-authoritative move validation
- `functions/paystack-webhook/` — Deposit confirmation

## Realtime tables (Section 13)

`games`, `player_hands`, `room_players`, `game_moves`

## Money

All amounts stored in **kobo** (integer). Display: divide by 100 for ₦.

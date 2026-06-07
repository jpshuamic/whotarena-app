# WhotArena Workflow

## What this file is for
This document is the single source of truth for the WhotArena project workflow. It contains the full build blueprint, the current progress, and the exact place to resume development.

Use this file when you are coding so you always know:
- what has already been completed,
- what remains to be built,
- the target business, game, and security requirements,
- and the exact next development phase.

---
## Current progress summary
- Phase 1 — Game engine: ✅ Completed
- Phase 2 — Backend: ✅ Mostly completed — Paystack webhook, withdrawal routing, game move handler, bot action executor, and join-room matchmaking/open-room reuse implemented
- Phase 3 — Player mobile app: In progress — auth onboarding, lobby, waiting room with polling, active game table, and live game session wiring
- Phase 4 — Admin dashboard: Not started
- Phase 5 — Polish and ship: Not started

### Resume point
The current handoff point is the player mobile app. The next work should continue the `whotarena-app/` mobile flow, especially:
- completing the waiting room and live game session data wiring
- finalizing the active game table UX
- ensuring real-time game state updates and session recovery

The repository currently contains:
- `whotarena-app/engine/` with game logic, rules, bot AI, and tests
- `whotarena-app/(auth)/` with mobile onboarding and phone OTP auth flow started
- `supabase/migrations/` with database schema and RLS policies
- `supabase/functions/` with edge functions for game move, join-room, and Paystack webhook handling
- `whotarena-admin/` with base admin app layout and global styles

---
## SECTION 1 — THE IDEA
### One line description
A real-money multiplayer Whot card game platform where players compete against each other or the house bot across different stake levels, with instant deposits and withdrawals.

### The problem it solves
- Nigerian players love Whot but have no digital platform to play it for real money
- Existing betting platforms only offer passive virtual sports
- No skill-based real-money card game platform exists for the West African market

### The opportunity
- Massive Whot player base across Nigeria and West Africa
- Mobile-first market with high Paystack adoption
- Skill perception keeps players engaged longer than pure chance games
- House-edge model generates revenue on every single game

---
## SECTION 2 — BUSINESS MODEL
### How money flows
1. Player deposits money into wallet
2. Player joins a game room at their chosen stake level
3. Entry fees from all players form the pot
4. House takes 10% rake from every pot
5. Winner receives the remaining 90%
6. When bot wins — house keeps the full 90% too

### The house edge principle
The platform operates like virtual betting: the outcome engine (bot) has a calibrated edge that guarantees profit over volume. Players feel in control because it is a real skill game.

### Revenue streams
1. RAKE — 10% from every game pot
2. BOT WINNINGS — when bot wins, house keeps the pot
3. TOURNAMENT MARGIN — entry fees minus prize pool
4. COSMETICS — card skins, table themes, avatars
5. VIP MEMBERSHIP — reduced rake and premium perks
6. REFERRAL SYSTEM — acquisition tool with bonus credit

### Stake levels
- Practice Room: Free, bot plays
- Bronze Room: ₦100, bot plays
- Silver Room: ₦500, bot plays
- Gold Room: ₦2,000, bot plays (bank > ₦500k)
- Diamond Room: ₦5,000, bot plays (bank > ₦5M)
- Tournament: Varies, bot does not play

### Financial protections
- House bank minimum based on stake levels
- Daily bot loss limit with admin emergency stop
- Real player vs real player takes priority
- Bots fill seats only when needed
- Bot never enters a game with potential payout > 2% of bank

---
## SECTION 3 — BOT SYSTEM
### Why the bot exists
- Keeps games available 24/7
- Fills empty seats instantly
- Generates additional revenue when it wins
- Maintains platform activity and illusion

### Bot identity system
- 20+ named bot accounts
- Human names, avatars, fake stats
- `is_bot = true` in the database
- Randomized thinking delay per move
- Occasional suboptimal play for realism

### Bot decision algorithm
Layer 1 — Legitimacy: only legal moves
Layer 2 — Human disguise: delay + mistakes
Layer 3 — Priority tree:
  1. punish opponent with special card
  2. empty hand fastest
  3. match shape and number
  4. call rare shape
  5. keep flexibility
Layer 4 — Opponent hand tracking
Layer 5 — Win rate calibration by room

### Win rate calibration
- Practice: 45%
- Bronze: 52%
- Silver: 55%
- Gold: 58%
- Diamond: 60%
- Tournament: no bots

### Admin bot controls
- target win rate per stake level
- active/inactive toggle
- thinking delay range
- aggression level
- permitted stake rooms
- daily loss limit contribution
- global bot fill ratio
- emergency stop

---
## SECTION 4 — WHOT GAME RULES
### Core rules
- Total cards: 54
- Shapes: Circle, Triangle, Cross, Square, Star
- Special card: Whot (20)
- Players: 2 to 5
- Starting hand: 5 cards
- Win condition: empty hand first

### Card distribution
- Circle: 1–14 (14 cards)
- Triangle: 1–10 (10 cards)
- Cross: 1–14 (14 cards)
- Square: 1–12 (12 cards)
- Star: 1–8 (8 cards)
- Whot: five 20s

### Special card effects
- 1 Hold On: next player skips turn
- 2 Pick Two: next player picks 2
- 5 Pick Three: next player picks 3
- 8 Suspension: next player skips
- 14 General Market: all others pick 1
- 20 Whot: caller chooses shape

### Playing rules
- Match top card by shape or number
- Whot can play on anything
- No valid move → draw from deck
- Pick Two / Pick Three can stack

### Game variants
- Launch: 1v1, 3-player free-for-all, 5-player free-for-all
- Post-launch: Speed Whot, 2v2 Team mode, Tournament bracket mode

### Game state tracked by server
- deck, discard pile, hands
- current turn and direction
- called shape after Whot
- pending pick count
- game status and winner
- full move history

### Disconnection rules
- 30-second reconnect window
- if not reconnected, bot takes over
- entry fee forfeited
- room continues without disconnected player

---
## SECTION 5 — SCREENS
### Player mobile app screens
1. Splash Screen
2. Welcome / Value Prop
3. Sign Up / Login
4. Phone OTP Verification
5. Home / Lobby
6. Wallet
7. Tournaments
8. Leaderboard
9. Profile
10. Waiting Room
11. Active Game Table
12. Game Result

### Admin dashboard screens
1. Dashboard Home
2. Players Management
3. Games Management
4. Bot Management
5. Wallet and Finance
6. Tournaments
7. Promotions and Bonuses
8. Leaderboard Management
9. Reports and Analytics
10. Support and Disputes
11. Content Management
12. Platform Settings

---
## SECTION 6 — VISUAL DIRECTION
### Direction
Bold, energetic, clean, friendly, mobile-first, Nigerian market DNA.

### Color palette
- Deep Navy: #0D1B2A
- Electric Blue: #1E90FF
- Vibrant Green: #00C853
- Warm White: #F5F5F5
- Gold: #FFD700
- Coral Red: #FF4444
- Dark Surface: #1A2B3C

### Mascot status and assets
- `mascot_happy.png` — done
- `mascot_celebrating.png`
- `mascot_sad.png`
- `mascot_thinking.png`
- `mascot_neutral.png`
- `mascot_welcome.png`

### Asset list
- app_icon.png
- logo_light.png
- logo_dark.png
- card_back.png
- table_felt.png
- empty_lobby.png
- empty_wallet.png
- empty_tournament.png
- win_celebration.png
- loss_screen.png

### Mascot prompt template
Same character, same art style, same colors, same gold chain, same cap, same jacket, same face and proportions.
Generate this specific expression and pose: [INSERT EXPRESSION DESCRIPTION].
Background: transparent. Format: square 1024x1024.

---
## SECTION 7 — TECH STACK
### Mobile app
- Expo + React Native
- TypeScript strict
- Expo Router
- NativeWind
- Zustand + AsyncStorage
- Supabase Realtime
- Supabase Auth (phone OTP)
- Paystack
- Expo Notifications
- PostHog

### Admin dashboard
- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Shadcn/UI
- Recharts
- Supabase service role backend
- Paystack Transfer API
- Vercel hosting

### Shared backend
- Supabase PostgreSQL
- Supabase Realtime
- Auth
- Storage
- Edge Functions

### Why Supabase
One platform replaces DB + WebSocket + auth. Free tier handles MVP launch and scales with revenue.

### Payments
- Paystack deposit: 1.5% + ₦100 per transaction
- Withdrawal send fee: ₦10–₦50 per transfer
- Minimum deposit: ₦2,000

---
## SECTION 8 — DATABASE SCHEMA
### Money units
Store every amount in kobo (integer). Display by dividing by 100.

### Tables
#### profiles
- id uuid
- username text
- phone text
- avatar_url text
- real_balance integer
- bonus_balance integer
- total_games integer
- total_wins integer
- win_rate decimal
- is_banned boolean
- is_bot boolean
- created_at timestamp

#### rooms
- id uuid
- stake_level text
- entry_fee integer
- max_players integer
- status text
- created_at timestamp

#### room_players
- id uuid
- room_id uuid
- player_id uuid
- seat_number integer
- has_paid boolean
- final_position integer
- joined_at timestamp

#### games
- id uuid
- room_id uuid
- status text
- current_turn uuid
- deck jsonb
- pile jsonb
- direction text
- winner_id uuid
- rake_amount integer
- started_at timestamp
- finished_at timestamp
- shuffle_seed text

#### player_hands
- id uuid
- game_id uuid
- player_id uuid
- cards jsonb
- updated_at timestamp

#### game_moves
- id uuid
- game_id uuid
- player_id uuid
- move_type text
- card_played jsonb
- whot_call text
- game_state jsonb
- created_at timestamp

#### transactions
- id uuid
- player_id uuid
- type text
- amount integer
- status text
- reference text
- game_id uuid
- created_at timestamp

#### tournaments
- id uuid
- name text
- entry_fee integer
- prize_pool integer
- max_players integer
- current_players integer
- status text
- starts_at timestamp
- created_at timestamp

#### bot_configs
- id uuid
- bot_id uuid
- target_win_rate decimal
- stake_levels text[]
- min_think_ms integer
- max_think_ms integer
- aggression decimal
- is_active boolean
- updated_at timestamp

#### platform_settings
- key text unique
- value jsonb
- updated_at timestamp

Default settings:
- `rake_percentage`: 10
- `min_deposit`: 200000
- `min_withdrawal`: 100000
- `max_daily_withdrawal`: 5000000
- `maintenance_mode`: false
- `bot_daily_loss_limit`: 5000000

---
## SECTION 9 — FOLDER STRUCTURE
### Mobile app
```
whotarena-app/
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   ├── game/
│   └── _layout.tsx
├── components/
├── constants/
├── engine/
├── hooks/
├── lib/
├── store/
├── types/
├── assets/
├── .env.example
├── app.json
├── package.json
└── tsconfig.json
```

### Admin dashboard
```
whotarena-admin/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
├── components/
├── lib/
├── .env.example
├── package.json
└── tsconfig.json
```

### Backend
```
supabase/
├── migrations/
└── functions/
```

---
## SECTION 10 — ENVIRONMENT VARIABLES
### Mobile app
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_APP_URL`

### Admin dashboard
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `ADMIN_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Critical security rules
- `EXPO_PUBLIC_` keys are public only
- service keys and Paystack secrets are admin-only
- bot algorithm never exposed to mobile client
- other players' cards never sent to wrong client

---
## SECTION 11 — SECURITY ARCHITECTURE
### Server-authoritative flow
1. Client validates move locally only for quick UI response
2. Client sends move to Supabase Edge Function
3. Server validates against true game state
4. Server updates database
5. Realtime broadcasts state to all players

### RLS policy principles
- players read only own profile and hand
- players read room/game state only for rooms they are in
- admin bypasses RLS securely

### Provably fair
- use seeded RNG for deck shuffles
- store seed in game state
- reveal seed after game ends for verification

---
## SECTION 12 — WALLET FLOWS
### Deposit flow
1. Player enters amount
2. Paystack checkout opens
3. Paystack webhook fires
4. server verifies signature
5. Supabase updates `real_balance`
6. app refreshes wallet

### Withdrawal flow
1. Player requests withdrawal
2. server validates balance
3. server calls Paystack Transfer API
4. transaction logged as pending
5. webhook updates status
6. real_balance debited

### Balance types
- `real_balance`: withdrawable funds
- `bonus_balance`: promo credit, not withdrawable until conditions met

### Anti-fraud rules
- must play at least one paid game before withdrawing
- withdrawal only to verified account
- daily limit per user
- suspicious activity flagged
- multi-account/device flags

---
## SECTION 13 — REALTIME ARCHITECTURE
### WebSocket flow
- players subscribe to Supabase Realtime room channel
- database changes broadcast instantly
- clients re-render from server state

### Realtime tables
- `games`
- `player_hands`
- `room_players`
- `game_moves`

### Disconnection handling
- disconnect shows reconnect countdown
- 30-second window
- if failed, bot takes over
- entry fee forfeited
- game continues

---
## SECTION 14 — BUILD ORDER
### Phase 1 — Game engine ✅
1. engine/cards.ts
2. engine/deck.ts
3. engine/moves.ts
4. engine/effects.ts
5. engine/state.ts
6. engine/bot.ts
7. engine/index.ts
8. tests/bot simulation

### Phase 2 — Backend
9. Supabase tables + RLS
10. Phone OTP auth
11. Paystack deposit webhook
12. Paystack withdrawal API
13. Supabase Edge Functions

### Phase 3 — Mobile app
14. Onboarding
15. Home / Lobby
16. Waiting room
17. Game table UI
18. Realtime flow
19. Wallet
20. Profile
21. Leaderboard
22. Tournament
23. Push notifications

### Phase 4 — Admin
24. Admin login + guard
25. Dashboard home
26. Players management
27. Game log + replay
28. Bot management
29. Finance queue
30. Tournament management
31. Platform settings
32. Analytics

### Phase 5 — Polish
33. Animations
34. Result screen
35. Mascot integration
36. Performance
37. Analytics events
38. Full flow test
39. Remove dev code
40. Secret scan
41. Production build
42. App store testing
43. Beta test
44. Launch

---
## SECTION 15 — CURSOR PROMPTING RULES
### Prompt structure
1. Anchor
2. Task
3. Constraints
4. Reference

### Constraint library
- preserve existing UI
- do not change files outside folder
- do not expose secrets
- do not add unrequested features
- do not refactor existing code unless asked

### Build loop
1. write prompt
2. send to AI
3. read diff
4. run app
5. test feature
6. test regressions
7. commit working feature
8. fix only if broken
9. next feature

---
## SECTION 16 — GROWTH STRATEGY AND LEGAL
### Growth strategy
- closed beta launch
- soft launch with referrals and TikTok
- scale via tournaments and viral campaigns
- West Africa expansion

### Legal requirements
- register company (CAC)
- apply for gaming license
- draft TOS, privacy, responsible gaming, KYC/AML
- budget ~₦350,000 for registration/legal

### Responsible gaming
- deposit limits
- self-exclusion
- session reminders
- reality checks

---
## SECTION 17 — MENTAL MODEL
- You are the casino.
- Profit comes from volume + slight edge.
- Rake is the door charge.
- Bot keeps tables full.
- One win by a player is part of the business.
- Build one feature at a time.
- Test before moving on.
- Commit every working feature.
- The app changes, the process stays the same.

---
## Where we left off
### Completed
- Full game engine and bot logic in `whotarena-app/engine`
- Deck, move validation, effects, state machine, bot AI
- Build order and README already document the plan

### Next focus
- backend Supabase schema + RLS
- auth and wallet flows
- Paystack deposit and withdrawal integration
- realtime game room flow
- mobile UI for lobby, game, and wallet
- admin dashboard for bot and finance management

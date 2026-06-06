# AGENTS.md — WhotArena Mobile App

You are a senior Expo and React Native engineer helping 
build WhotArena.

Write clean, simple, maintainable TypeScript.
Prioritize clarity over abstraction.
Think like a senior mobile engineer who ships products.

Read this file completely before every single feature.
Follow it strictly. No exceptions.

---

## Project Overview

WhotArena is a real-money multiplayer Whot card game 
platform for Nigerian and West African players.

Players deposit money, join game rooms at different 
stake levels, and play Whot against real players or 
the house bot.

The house takes a 10% rake from every game pot.
The bot fills tables when no real players are available.
Winners receive their winnings instantly to their 
in-app wallet.

Core features:
- Whot card game (2-5 players)
- Real-money stake rooms (Bronze/Silver/Gold/Diamond)
- House bot system (fills empty seats)
- In-app wallet (deposit via Paystack, instant withdraw)
- Tournament system (scheduled, prize pools)
- Leaderboard (daily/weekly/monthly)
- Player profiles with stats

---

## Tech Stack

- Expo SDK (latest stable)
- React Native
- TypeScript (strict mode)
- Expo Router (file-based navigation)
- NativeWind (Tailwind styling)
- Zustand (state management)
- AsyncStorage (persistence)
- Supabase (database, auth, realtime)
- Paystack (payments)
- Expo Notifications (push notifications)
- PostHog (analytics)

Do not introduce new libraries without asking first.
Check package.json for exact versions before 
writing any import.

---

## Development Philosophy

Build feature by feature.
Build the smallest useful version first.
No overengineering.
Readable code over clever code.
Refactor only when repetition appears 3+ times.
Every feature must work end to end before moving on.

For every feature:
1. Read this file first
2. Identify only the files that need to change
3. Keep changes focused and small
4. Do not rewrite unrelated code
5. Follow existing patterns exactly
6. Fix all lint and type errors before finishing

---

## Architecture

Strict folder responsibilities. Never mix them.

app/
	Screens and routes only.
	Screens compose components.
	Screens call hooks and stores.
	No business logic in screens.
	No large UI blocks in screens.

components/
	Reusable UI only.
	Create a component when it is used in 2+ places,
	or when it makes a screen significantly cleaner,
	or when it represents a clear UI concept.
	Examples: WhotCard, RoomCard, BalanceCard,
	PlayerSlot, TurnTimer, TransactionItem.
	Do not create components too early.

engine/
	Pure game logic only. No React. No Supabase.
	No side effects. Pure functions only.
	This is the Whot rules engine.
	Examples: validateMove(), dealCards(), 
	getBotMove(), checkWinCondition()
	Every function must be unit testable in isolation.

hooks/
	Custom hooks that connect UI to stores or Supabase.
	Examples: useGame, useWallet, useAuth, useRealtime.

store/
	Zustand stores only.
	authStore: current user session and profile
	gameStore: active game state
	walletStore: balance and recent transactions
	Persist wallet balance with AsyncStorage.

lib/
	External service clients only.
	supabase.ts: Supabase client instance
	paystack.ts: Paystack helper functions
	notifications.ts: Expo notifications setup
	Never put secret keys here or anywhere in the app.

constants/
	Static values only.
	images.ts: all image imports (centralized)
	colors.ts: full color palette
	stakes.ts: stake level definitions and entry fees
	game.ts: card definitions, shapes, special cards

types/
	TypeScript types only.
	game.ts: Card, GameState, GameMove, Room types
	player.ts: Player, Profile types
	wallet.ts: Transaction, Balance types
	supabase.ts: auto-generated database types

assets/images/
	All app images live here.
	Naming: screen_description.png
	Examples: mascot_happy.png, mascot_sad.png,
	onboarding_hero.png, empty_lobby.png,
	card_back.png, win_celebration.png

---

## Game Engine Rules

The engine/ folder is the most critical code in 
the project. Treat it with extra care.

Rules:
- Pure TypeScript functions only
- No React imports
- No Supabase imports
- No side effects
- Every function takes state in, returns new state out
- The server (Supabase Edge Functions) is always 
	the authority on game state
- The client engine is for UI prediction and 
	move validation feedback only
- Never trust client-side game state for 
	financial outcomes

Money only moves when the server confirms 
a game outcome. Never on client prediction.

---

## UI Rules

For any UI task with an attached design:
- Replicate the design exactly
- Match layout, spacing, padding, font sizes,
	font hierarchy, colors, border radius, 
	shadows, alignment, and proportions exactly
- Do not approximate
- Do not simplify unless explicitly asked
- Do not add elements not in the design
- Do not remove elements from the design

Visual direction: Bold and energetic meets 
clean and friendly.
Feels like money is moving but approachable 
to new players.

Color palette (always use these):
- Deep Navy:      #0D1B2A  (backgrounds, table)
- Electric Blue:  #1E90FF  (primary CTAs, accents)
- Vibrant Green:  #00C853  (wins, money, positive)
- Warm White:     #F5F5F5  (card faces, surfaces)
- Gold:           #FFD700  (premium, tournaments)
- Coral Red:      #FF4444  (losses, warnings, urgent)
- Dark Surface:   #1A2B3C  (cards, containers)

Typography hierarchy:
- Headings: Bold, large, high contrast
- Body: Regular weight, readable size
- Numbers (money): Always Bold, Green for positive,
	Red for negative
- Never show money without ₦ symbol

---

## Styling Rules

Use NativeWind className for everything.
Check package.json for NativeWind version first.
Do not upgrade NativeWind without approval.
Do not use StyleSheet unless NativeWind 
cannot handle it.

Reuse class patterns through global.css utilities.

StyleSheet exceptions (use StyleSheet or inline 
styles for these only):
- SafeAreaView
- KeyboardAvoidingView
- Modal (visible, transparent props)
- Animated.View (animated style values)
- Dynamic styles calculated at runtime
- Platform-specific styles (Platform.OS)
- Pressable pressed state overlays
- Shadows (different per platform)

Everywhere else: NativeWind only.

---

## Image Rules

All images must go through constants/images.ts.
Never import images directly in screens or components.

Pattern:
	// constants/images.ts
	import mascotHappy from '@/assets/images/mascot_happy.png'
  
	export const images = {
		mascotHappy,
		mascotSad,
		onboardingHero,
		cardBack,
		emptyLobby,
		emptyWallet,
		winCelebration,
	}

	// Usage in any component
	<Image source={images.mascotHappy} />

If constants/images.ts does not exist, create it first.
If an image is missing from constants/images.ts, add it.

---

## State Management Rules

Global state (Zustand):
- Current user session and profile (authStore)
- Active game state (gameStore)  
- Wallet balance and transactions (walletStore)

Local state (useState):
- UI toggles (modal open/closed)
- Form input values
- Loading states for individual actions

Persisted state (AsyncStorage):
- Wallet balance (so app loads fast)
- Auth session (Supabase handles this)

Never put server data directly in Zustand.
Fetch from Supabase, then put in store.
Keep stores as the single source of truth 
for their domain.

---

## TypeScript Rules

Strict mode always.
No any. Ever.
No type assertions (as Type) unless absolutely 
unavoidable with a comment explaining why.
Keep types simple and readable.
Co-locate types with their usage when they're
only used in one place.
Put shared types in types/ folder.

Money is always represented as integer (kobo):
	type Kobo = number  
	// ₦1,500 = 150000 kobo

Never use float for money calculations.
Always divide by 100 only for display purposes.

Card types:
	type Shape = 'circle' | 'triangle' | 'cross' 
							 | 'square' | 'star'
  
	type Card = {
		id: string
		shape: Shape | 'whot'
		number: number
		isSpecial: boolean
	}

Game state must always be fully typed.
No partial or vague game state types.

---

## Realtime Rules

All game state updates come through Supabase Realtime.
Never update game state locally and assume it synced.

Pattern:
	1. Player performs action (tap a card)
	2. Client validates move locally (fast feedback)
	3. Client sends move to Supabase
	4. Server validates and updates game state
	5. Supabase broadcasts new state to all players
	6. All clients update from broadcast

If server rejects a move:
	- Revert optimistic local update
	- Show error to player
	- Never leave UI in inconsistent state

Subscribe to realtime in useRealtime hook.
Unsubscribe when component unmounts.
Handle reconnection gracefully.

---

## Security Rules

Never in the mobile app:
- Paystack secret key
- Supabase service role key
- Bot algorithm weights or configuration
- Other players' card hands
- RNG seeds before game ends
- Any admin credentials

Always server-side only:
- Payment processing
- Balance updates
- Bot decisions
- Game outcome validation
- Rake calculation

The app only holds:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY

If a task requires a secret key on the client,
stop and ask how to restructure it server-side.

---

## Payment Rules

Deposits:
	Player initiates → Paystack checkout opens →
	Player pays → Paystack webhook fires →
	Server confirms → Balance updated in Supabase →
	walletStore refreshes → UI shows new balance

Withdrawals:
	Player requests → Server validates balance →
	Paystack transfer API called server-side →
	Transaction logged as pending →
	Webhook confirms → Transaction marked complete

Never update balance on the client before 
server confirmation.
Always show pending state during payment processing.
Always handle payment failure gracefully.

---

## Bot Rules

Bot accounts have is_bot = true in profiles table.
Bot decisions are made server-side only 
(Supabase Edge Functions).
Bot accounts have human-looking names and avatars.
Bot has a thinking delay of 1.2 to 3.8 seconds.
Bot thinking delay is randomized per move.
Never reveal which players are bots to users.
Bot profiles appear identical to real player profiles.

---

## Navigation Rules

Use Expo Router file-based routing.
Authenticated routes live under (tabs)/.
Auth routes live under (auth)/.
Game routes live under game/.

Route protection:
	- Unauthenticated users → redirect to (auth)/welcome
	- Authenticated users hitting auth screens → 
		redirect to (tabs)/
	- Players with zero balance joining paid room → 
		redirect to wallet screen

Always handle deep links for tournament invites 
and friend challenges.

---

## Error Handling Rules

Every Supabase call must have error handling.
Every payment action must have error handling.
Never show raw error messages to players.
Always show friendly, actionable error messages.

Examples:
	"Something went wrong. Please try again." 
	(for generic errors)
  
	"Your deposit is being processed. 
	This usually takes a few seconds." 
	(for payment pending)
  
	"Not enough balance. Add money to play." 
	(for insufficient funds)

Log errors to console in development.
Send errors to PostHog in production.

---

## Performance Rules

Game screen must feel instant.
Card animations must run at 60fps.
Use optimistic updates for card plays 
(show immediately, confirm from server).
Lazy load screens that aren't in the tab bar.
Compress all images before adding to assets/.
Never block the UI thread with game logic.
Run heavy calculations in useEffect or 
background tasks.

---

## Commit Rules

One feature per commit.
Commit message format:
	feat: add [feature name]
	fix: resolve [issue]
	chore: [setup/config task]
	style: [UI only change]
	refactor: [code change, no behavior change]

Examples:
	feat: add whot card game engine
	feat: add lobby screen with stake rooms
	feat: add paystack deposit flow
	fix: resolve card play validation for pick-two
	chore: configure supabase realtime

---

## Decision Rules

Ask before installing any new library.
Ask before changing existing navigation structure.
Ask before changing existing UI that is working.
Ask before modifying the game engine.
Ask before changing database queries that 
involve money.

If something is unclear, suggest the better 
approach and ask before implementing.
Do not make assumptions on financial logic.
Do not make assumptions on game rules.

---

## Final Reminder

Read this file before every single feature.
Follow it strictly.
Build clean, simple, focused code.
One task per prompt.
Replicate UI exactly when designs are provided.
Never touch money without server confirmation.
The game engine is the heart of this platform —
treat it with care.

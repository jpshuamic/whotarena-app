# WhotArena Build Order — 44 Steps, 5 Phases

## Phase 1 — Game Engine ✅ (current)

1. ✅ `engine/cards.ts` — Card types + full deck
2. ✅ `engine/deck.ts` — Shuffle + deal + draw (seeded/provably fair)
3. ✅ `engine/moves.ts` — Valid move detection
4. ✅ `engine/effects.ts` — Special card effects
5. ✅ `engine/state.ts` — Game state machine + applyMove
6. ✅ `engine/bot.ts` — Bot decision algorithm (5 layers)
7. ✅ `engine/index.ts` — Clean exports
8. ✅ `engine/tests/` — Bot vs bot 1000 game simulation

## Phase 2 — Backend

9. Supabase tables + all RLS policies
10. Phone OTP auth flow
11. Wallet: Paystack deposit (webhook)
12. Wallet: Paystack withdrawal (transfer API)
13. Edge Functions: bot logic, rake, anti-fraud

## Phase 3 — Player Mobile App

14. Onboarding screens (welcome, auth, verify)
15. Home / Lobby screen
16. Waiting room + matchmaking
17. Game table UI
18. Realtime game flow (end to end)
19. Wallet screen
20. Profile + stats screen
21. Leaderboard screen
22. Tournament screen
23. Push notifications

## Phase 4 — Admin Dashboard

24. Admin login + role guard
25. Dashboard home (live stats)
26. Player management
27. Game log + replay
28. Bot management + win rate config
29. Finance + withdrawal queue
30. Tournament creation + management
31. Platform settings + maintenance mode
32. Analytics + charts

## Phase 5 — Polish and Ship

33. Card animations (60fps)
34. Result screen animations
35. Mascot integration
36. Performance optimization
37. PostHog analytics events
38. Full flow test (iOS + Android)
39. Remove dev utilities
40. Secret scanner
41. Production EAS build
42. TestFlight + Google Play internal
43. Beta test
44. Public launch

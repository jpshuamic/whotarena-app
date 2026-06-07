# whotarena-app

Expo + React Native player app for WhotArena.

## Screens (Section 5)

| # | Route | Screen |
|---|-------|--------|
| 1 | `app/index.tsx` | Splash |
| 2 | `app/(auth)/welcome.tsx` | Welcome |
| 3 | `app/(auth)/login.tsx` | Sign Up / Login |
| 4 | `app/(auth)/verify.tsx` | Phone OTP |
| 5 | `app/(tabs)/index.tsx` | Home / Lobby |
| 6 | `app/(tabs)/wallet.tsx` | Wallet |
| 7 | `app/(tabs)/tournaments.tsx` | Tournaments |
| 8 | `app/(tabs)/leaderboard.tsx` | Leaderboard |
| 9 | `app/(tabs)/profile.tsx` | Profile |
| 10 | `app/game/waiting.tsx` | Waiting Room |
| 11 | `app/game/[gameId].tsx` | Active Game |
| 12 | `app/game/result.tsx` | Game Result |

## Run

```bash
npm install
cp .env.example .env
npx expo start
```

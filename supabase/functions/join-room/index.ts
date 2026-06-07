import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createInitialGameState } from '../_shared/state.ts';
import type { GameVariant, PlayerSlot, StakeLevel } from '../_shared/types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SUPABASE_KEY}`,
  apikey: SUPABASE_KEY,
};
const RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
};

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

async function fetchSupabase(path: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL.replace(/\/?$/, '')}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed ${response.status}: ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function getUserFromAuth(authorization: string | null) {
  if (!authorization) return null;
  const url = `${SUPABASE_URL.replace(/\/?$/, '')}/auth/v1/user`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: authorization,
      apikey: SUPABASE_KEY,
    },
  });

  if (!response.ok) return null;
  return response.json();
}

const ROOM_CONFIG: Record<StakeLevel, { entryFee: number; maxPlayers: number; variant: GameVariant; botEnabled: boolean }> = {
  practice: { entryFee: 0, maxPlayers: 5, variant: '1v1', botEnabled: true },
  bronze: { entryFee: 10_000, maxPlayers: 5, variant: '1v1', botEnabled: true },
  silver: { entryFee: 50_000, maxPlayers: 5, variant: '3player', botEnabled: true },
  gold: { entryFee: 200_000, maxPlayers: 5, variant: '3player', botEnabled: true },
  diamond: { entryFee: 500_000, maxPlayers: 5, variant: '5player', botEnabled: true },
  tournament: { entryFee: 0, maxPlayers: 100, variant: '5player', botEnabled: false },
};

function getBotCount(variant: GameVariant): number {
  if (variant === '1v1') return 1;
  if (variant === '3player') return 2;
  return 4;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return createJsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return createJsonResponse({ error: 'Supabase environment not configured' }, 500);
  }

  const authUser = await getUserFromAuth(req.headers.get('authorization'));
  if (!authUser?.id) {
    return createJsonResponse({ error: 'Unauthorized' }, 401);
  }

  const payload = await req.json();
  const roomLevel = String(payload.roomLevel ?? '').trim() as StakeLevel;
  if (!roomLevel || !(roomLevel in ROOM_CONFIG)) {
    return createJsonResponse({ error: 'Invalid room level' }, 400);
  }

  const config = ROOM_CONFIG[roomLevel];

  const roomRows = await fetchSupabase(
    `/rest/v1/rooms?select=id,entry_fee,max_players,status&stake_level=eq.${encodeURIComponent(roomLevel)}&status=eq.waiting`,
  );

  let roomId: string | undefined;
  let existingPlayers: any[] = [];

  if (Array.isArray(roomRows) && roomRows.length > 0) {
    for (const room of roomRows) {
      const playerRows = await fetchSupabase(
        `/rest/v1/room_players?room_id=eq.${encodeURIComponent(room.id)}&select=player_id,seat_number,profiles(is_bot)&order=seat_number.asc`,
      );

      if (!Array.isArray(playerRows)) continue;
      if (playerRows.some((row: any) => row.player_id === authUser.id)) {
        existingPlayers = playerRows;
        roomId = room.id;
        break;
      }

      if (playerRows.length < room.max_players) {
        existingPlayers = playerRows;
        roomId = room.id;
        break;
      }
    }
  }

  if (!roomId) {
    const insertRoom = await fetchSupabase('/rest/v1/rooms', {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        stake_level: roomLevel,
        entry_fee: config.entryFee,
        max_players: config.maxPlayers,
        status: 'waiting',
      }),
    });

    roomId = Array.isArray(insertRoom) ? insertRoom[0]?.id : insertRoom?.id;
    existingPlayers = [];
  }

  if (!roomId) {
    return createJsonResponse({ error: 'Unable to resolve room record' }, 500);
  }

  const isAlreadyJoined = existingPlayers.some((row: any) => row.player_id === authUser.id);

  if (!isAlreadyJoined) {
    await fetchSupabase('/rest/v1/room_players', {
      method: 'POST',
      body: JSON.stringify({
        id: crypto.randomUUID(),
        room_id: roomId,
        player_id: authUser.id,
        seat_number: existingPlayers.length,
        has_paid: true,
      }),
    });

    existingPlayers.push({ player_id: authUser.id, seat_number: existingPlayers.length, profiles: { is_bot: false } });
  }

  const activePlayers: PlayerSlot[] = existingPlayers.map((row: any) => ({
    id: row.player_id,
    seatNumber: row.seat_number,
    isBot: row.profiles?.is_bot ?? false,
  }));

  const requiredPlayers = config.variant === '1v1' ? 2 : config.variant === '3player' ? 3 : 5;
  const missingPlayers = Math.max(0, requiredPlayers - activePlayers.length);

  if (!config.botEnabled && missingPlayers > 0) {
    return createJsonResponse({
      roomId,
      status: 'waiting',
      players: activePlayers.length,
      requiredPlayers,
      entry_fee: config.entryFee,
      stake_level: roomLevel,
    });
  }

  const botProfiles = await Promise.all(
    Array.from({ length: missingPlayers }, (_, index) =>
      fetchSupabase('/rest/v1/profiles', {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          username: `Bot ${Math.floor(Math.random() * 9000) + 1000}`,
          is_bot: true,
        }),
      }),
    ),
  );

  const botPlayers: PlayerSlot[] = botProfiles.map((profile: any, index: number) => {
    const id = Array.isArray(profile) ? profile[0]?.id ?? '' : profile.id;
    return {
      id,
      seatNumber: activePlayers.length + index,
      isBot: true,
    };
  });

  if (botPlayers.length > 0) {
    await fetchSupabase('/rest/v1/room_players', {
      method: 'POST',
      body: JSON.stringify(
        botPlayers.map((player) => ({
          id: crypto.randomUUID(),
          room_id: roomId,
          player_id: player.id,
          seat_number: player.seatNumber,
          has_paid: true,
        })),
      ),
    });
  }

  const allPlayers = [...activePlayers, ...botPlayers];
  const gameState = createInitialGameState(roomId, allPlayers, config.variant);
  const gameId = crypto.randomUUID();

  await fetchSupabase('/rest/v1/games', {
    method: 'POST',
    body: JSON.stringify({
      id: gameId,
      room_id: roomId,
      status: gameState.status,
      current_turn: gameState.currentPlayerId,
      deck: gameState.deck,
      pile: gameState.pile,
      direction: gameState.direction,
      called_shape: gameState.calledShape,
      pending_pick: gameState.pendingPick,
      pending_pick_type: gameState.pendingPickType,
      winner_id: null,
      rake_amount: 0,
      shuffle_seed: gameState.shuffleSeed,
      variant: gameState.variant,
      started_at: new Date(gameState.startedAt ?? Date.now()).toISOString(),
      finished_at: null,
    }),
  });

  await fetchSupabase(`/rest/v1/rooms?id=eq.${encodeURIComponent(roomId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'active' }),
  });

  await fetchSupabase('/rest/v1/player_hands', {
    method: 'POST',
    body: JSON.stringify(
      allPlayers.map((player) => ({
        id: crypto.randomUUID(),
        game_id: gameId,
        player_id: player.id,
        cards: gameState.hands[player.id] ?? [],
      })),
    ),
  });

  return createJsonResponse({ gameId });
});

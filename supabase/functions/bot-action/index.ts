/**
 * Bot move executor (Section 3)
 * Runs server-side bot decisions for active bot turns.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { applyMove, calculatePotKobo } from '../_shared/state.ts';
import { getBotMove, getBotConfigForStake } from '../_shared/bot.ts';
import type { GameState, PlayerSlot } from '../_shared/types.ts';

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

  const body = await req.json();
  const gameId = String(body.gameId ?? '');

  if (!gameId) {
    return createJsonResponse({ error: 'Missing gameId' }, 400);
  }

  try {
    const [gameRows, handRows, moveRows] = await Promise.all([
      fetchSupabase(
        `/rest/v1/games?select=*,room_id,current_turn,direction,called_shape,pending_pick,pending_pick_type,winner_id,status,deck,pile,shuffle_seed,started_at,finished_at,variant&order=created_at.desc&id=eq.${encodeURIComponent(gameId)}`,
      ),
      fetchSupabase(`/rest/v1/player_hands?game_id=eq.${encodeURIComponent(gameId)}`),
      fetchSupabase(`/rest/v1/game_moves?game_id=eq.${encodeURIComponent(gameId)}&select=player_id,move_type,card_played,whot_call,created_at&order=created_at.asc`),
    ]);

    const game = Array.isArray(gameRows) ? gameRows[0] : null;
    if (!game) {
      return createJsonResponse({ error: 'Game not found' }, 404);
    }

    const [roomRows, roomPlayers] = await Promise.all([
      fetchSupabase(`/rest/v1/rooms?select=stake_level,entry_fee&id=eq.${encodeURIComponent(game.room_id)}`),
      fetchSupabase(
        `/rest/v1/room_players?room_id=eq.${encodeURIComponent(game.room_id)}&select=player_id,seat_number,has_paid,profiles(is_bot)&order=seat_number.asc`,
      ),
    ]);

    const room = Array.isArray(roomRows) ? roomRows[0] : null;
    if (!room) {
      return createJsonResponse({ error: 'Room not found' }, 404);
    }

    const players: PlayerSlot[] = Array.isArray(roomPlayers)
      ? roomPlayers.map((row: any) => ({
          id: row.player_id,
          seatNumber: row.seat_number,
          isBot: row.profiles?.is_bot ?? false,
        }))
      : [];

    if (!players.some((player) => player.id === authUser.id && !player.isBot)) {
      return createJsonResponse({ error: 'Player is not part of this game' }, 403);
    }

    const hands = (Array.isArray(handRows) ? handRows : []).reduce(
      (memo: Record<string, any>, row: any) => ({
        ...memo,
        [row.player_id]: row.cards ?? [],
      }),
      {},
    );

    const moveHistory = (Array.isArray(moveRows) ? moveRows : []).map((row: any) => ({
      playerId: row.player_id,
      moveType: row.move_type,
      cardPlayed: row.card_played,
      whotCall: row.whot_call,
      timestamp: new Date(row.created_at).getTime(),
    }));

    const state: GameState = {
      id: game.id,
      roomId: game.room_id,
      status: game.status,
      variant: game.variant ?? '1v1',
      players,
      hands,
      deck: game.deck ?? [],
      pile: game.pile ?? [],
      currentPlayerId: game.current_turn,
      direction: game.direction,
      calledShape: game.called_shape,
      pendingPick: game.pending_pick,
      pendingPickType: game.pending_pick_type,
      winnerId: game.winner_id,
      moveHistory,
      shuffleSeed: game.shuffle_seed,
      startedAt: game.started_at ? new Date(game.started_at).getTime() : null,
      finishedAt: game.finished_at ? new Date(game.finished_at).getTime() : null,
    };

    if (state.status !== 'active') {
      return createJsonResponse({ error: 'Game is not active' }, 400);
    }

    const botPlayer = players.find((player) => player.id === state.currentPlayerId && player.isBot);
    if (!botPlayer) {
      return createJsonResponse({ error: 'Current player is not a bot' }, 400);
    }

    const botConfig = getBotConfigForStake(room.stake_level);
    const opponentCardCounts = Object.fromEntries(
      Object.entries(state.hands).map(([playerId, cards]) => [playerId, cards.length]),
    );

    const botMove = getBotMove({
      botId: botPlayer.id,
      state,
      opponentCardCounts,
      config: botConfig,
      calibrateDown: false,
    });

    if (!botMove) {
      return createJsonResponse({ error: 'Bot has no legal move' }, 400);
    }

    const nextState = applyMove(state, botMove);
    const updatedGame: Record<string, unknown> = {
      deck: nextState.deck,
      pile: nextState.pile,
      current_turn: nextState.currentPlayerId,
      direction: nextState.direction,
      called_shape: nextState.calledShape,
      pending_pick: nextState.pendingPick,
      pending_pick_type: nextState.pendingPickType,
      winner_id: nextState.winnerId,
      status: nextState.status,
      finished_at: nextState.finishedAt ? new Date(nextState.finishedAt).toISOString() : null,
    };

    const settlementOperations: Promise<unknown>[] = [];
    if (nextState.status === 'finished' && nextState.winnerId) {
      const paidPlayers = Array.isArray(roomPlayers)
        ? roomPlayers.filter((row: any) => row.has_paid ?? true)
        : [];
      const playerCount = paidPlayers.length || players.length;
      const { pot, rake, winnerPayout } = calculatePotKobo(Number(room.entry_fee ?? 0), playerCount);
      updatedGame['rake_amount'] = nextState.players.some((player) => player.id === nextState.winnerId && player.isBot)
        ? pot
        : rake;

      const winner = players.find((player) => player.id === nextState.winnerId);
      if (!winner) {
        return createJsonResponse({ error: 'Winner not found in game players' }, 500);
      }

      if (!winner.isBot && winnerPayout > 0) {
        settlementOperations.push(
          fetchSupabase('/rpc/increment_profile_balance', {
            method: 'POST',
            body: JSON.stringify({ profile_uuid: winner.id, delta: winnerPayout }),
          }),
        );

        settlementOperations.push(
          fetchSupabase('/rest/v1/transactions', {
            method: 'POST',
            body: JSON.stringify({
              player_id: winner.id,
              type: 'game_win',
              amount: winnerPayout,
              status: 'completed',
              game_id: game.id,
            }),
          }),
        );

        settlementOperations.push(
          fetchSupabase('/rest/v1/transactions', {
            method: 'POST',
            body: JSON.stringify({
              player_id: winner.id,
              type: 'rake',
              amount: rake,
              status: 'completed',
              game_id: game.id,
            }),
          }),
        );
      }

      if (winner.isBot && pot > 0) {
        settlementOperations.push(
          fetchSupabase('/rest/v1/transactions', {
            method: 'POST',
            body: JSON.stringify({
              player_id: winner.id,
              type: 'rake',
              amount: pot,
              status: 'completed',
              game_id: game.id,
            }),
          }),
        );
      }
    }

    const updateGamePromise = fetchSupabase(
      `/rest/v1/games?id=eq.${encodeURIComponent(gameId)}`,
      {
        method: 'PATCH',
        headers: {
          ...DEFAULT_HEADERS,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(updatedGame),
      },
    );

    const handUpdates = Object.entries(nextState.hands).map(([playerId, cards]) =>
      fetchSupabase(
        `/rest/v1/player_hands?game_id=eq.${encodeURIComponent(gameId)}&player_id=eq.${encodeURIComponent(playerId)}`,
        {
          method: 'PATCH',
          headers: {
            ...DEFAULT_HEADERS,
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ cards }),
        },
      ),
    );

    const movePayload = {
      game_id: gameId,
      player_id: botPlayer.id,
      move_type: botMove.type,
      card_played: botMove.type === 'play' ? state.hands[botPlayer.id]?.find((card: any) => card.id === botMove.cardId) ?? null : null,
      whot_call: botMove.type === 'play' ? botMove.whotCall ?? null : null,
      game_state: nextState,
    };

    const moveInsertPromise = fetchSupabase('/rest/v1/game_moves', {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(movePayload),
    });

    await Promise.all([updateGamePromise, moveInsertPromise, ...handUpdates, ...settlementOperations]);

    return createJsonResponse({ ok: true, botMove, nextState });
  } catch (error) {
    return createJsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

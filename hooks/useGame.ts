import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtime } from './useRealtime';
import type { GameState, MoveInput, GameMove, PlayerSlot } from '../types/game';

async function normalizeGameState(gameId: string): Promise<GameState | null> {
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select(
      'id,room_id,status,current_turn,direction,called_shape,pending_pick,pending_pick_type,winner_id,deck,pile,shuffle_seed,started_at,finished_at,variant',
    )
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    return null;
  }

  const [{ data: handRows, error: handError }, { data: playerRows, error: playerError }, { data: moveRows, error: moveError }] = await Promise.all([
    supabase
      .from('player_hands')
      .select('player_id,cards')
      .eq('game_id', gameId),
    supabase
      .from('room_players')
      .select('player_id,seat_number,profiles(is_bot)')
      .eq('room_id', game.room_id),
    supabase
      .from('game_moves')
      .select('player_id,move_type,card_played,whot_call,created_at')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true }),
  ]);

  if (handError || playerError || moveError) {
    return null;
  }

  const players: PlayerSlot[] = (playerRows ?? []).map((row: any) => ({
    id: row.player_id,
    seatNumber: row.seat_number,
    isBot: row.profiles?.is_bot ?? false,
  }));

  const hands = (handRows ?? []).reduce((memo: Record<string, any>, row: any) => ({
    ...memo,
    [row.player_id]: row.cards ?? [],
  }), {});

  const moveHistory: GameMove[] = (moveRows ?? []).map((row: any) => ({
    playerId: row.player_id,
    moveType: row.move_type,
    cardPlayed: row.card_played,
    whotCall: row.whot_call,
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  }));

  return {
    id: game.id,
    roomId: game.room_id,
    status: game.status as GameState['status'],
    variant: (game.variant as GameState['variant']) ?? '1v1',
    players,
    hands,
    deck: game.deck ?? [],
    pile: game.pile ?? [],
    currentPlayerId: game.current_turn ?? '',
    direction: game.direction as GameState['direction'] ?? 'normal',
    calledShape: game.called_shape ?? null,
    pendingPick: game.pending_pick ?? 0,
    pendingPickType: game.pending_pick_type ?? null,
    winnerId: game.winner_id ?? null,
    moveHistory,
    shuffleSeed: game.shuffle_seed ?? '',
    startedAt: game.started_at ? new Date(game.started_at).getTime() : null,
    finishedAt: game.finished_at ? new Date(game.finished_at).getTime() : null,
  };
}

/** Connects UI to server-authoritative game state (Section 11) */
export function useGame(gameId: string | null) {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    if (!gameId) {
      setState(null);
      return;
    }

    setLoading(true);
    const normalized = await normalizeGameState(gameId);
    setLoading(false);

    if (!normalized) {
      setError('Unable to load game state.');
      setState(null);
      return;
    }

    setError(null);
    setState(normalized);
  }, [gameId]);

  useEffect(() => {
    void fetchState();
  }, [fetchState]);

  useEffect(() => {
    if (!gameId) return undefined;

    const unsubscribeGames = useRealtime('games', `id=eq.${encodeURIComponent(gameId)}`, fetchState);
    const unsubscribeHands = useRealtime('player_hands', `game_id=eq.${encodeURIComponent(gameId)}`, fetchState);

    return () => {
      unsubscribeGames();
      unsubscribeHands();
    };
  }, [fetchState, gameId]);

  const submitMove = useCallback(
    async (move: MoveInput) => {
      if (!gameId) {
        throw new Error('Missing game id.');
      }

      const { data, error } = await supabase.functions.invoke('game-move', {
        method: 'POST',
        body: JSON.stringify({ gameId, move }),
      });

      if (error) {
        throw new Error(error.message ?? 'Failed to submit move');
      }

      await fetchState();
      return data;
    },
    [fetchState, gameId],
  );

  const submitBotTurn = useCallback(async () => {
    if (!gameId) {
      throw new Error('Missing game id.');
    }

    const { data, error } = await supabase.functions.invoke('bot-action', {
      method: 'POST',
      body: { gameId },
    });

    if (error) {
      throw new Error(error.message ?? 'Failed to submit bot turn');
    }

    await fetchState();
    return data;
  }, [fetchState, gameId]);

  return {
    state,
    loading,
    error,
    submitMove,
    submitBotTurn,
    reconnectCountdownMs: 30_000,
  };
}

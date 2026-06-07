import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useGame } from '../../hooks/useGame';
import { getValidPlayableCards } from '../../engine/moves';
import { GameCard } from '../../components/game/GameCard';
import { colors } from '../../constants/colors';
import type { MoveInput } from '../../types/game';

export default function ActiveGameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const { state, loading, error, submitMove, submitBotTurn, reconnectCountdownMs } = useGame(
    gameId ?? null,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const handledBotTurnRef = useRef<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };

    void loadUser();
  }, []);

  const currentPlayerId = state?.currentPlayerId ?? '';
  const moveCount = state?.moveHistory.length ?? 0;
  const localPlayerId = useMemo(() => {
    if (!userId) return '';
    return state?.players.some((player) => player.id === userId) ? userId : '';
  }, [state?.players, userId]);

  const localHand = state?.hands?.[localPlayerId] ?? [];
  const playableCards = state && localPlayerId ? getValidPlayableCards(state, localPlayerId) : [];
  const isLocalTurn = Boolean(localPlayerId) && localPlayerId === currentPlayerId;
  const currentPlayer = state?.players.find((player) => player.id === currentPlayerId);
  const firstRealPlayerId = useMemo(() => {
    return state?.players
      .filter((player) => !player.isBot)
      .sort((a, b) => a.seatNumber - b.seatNumber)[0]?.id ?? '';
  }, [state?.players]);
  const shouldExecuteBotTurn =
    Boolean(localPlayerId) &&
    localPlayerId === firstRealPlayerId &&
    currentPlayer?.isBot === true &&
    state?.status === 'active';

  useEffect(() => {
    if (!gameId || !shouldExecuteBotTurn) {
      setBotThinking(false);
      return undefined;
    }

    const turnKey = `${gameId}:${currentPlayerId}:${moveCount}`;
    if (handledBotTurnRef.current === turnKey) {
      return undefined;
    }

    handledBotTurnRef.current = turnKey;
    setBotThinking(true);

    const delayMs = 1200 + Math.floor(Math.random() * 2600);
    const timeout = setTimeout(() => {
      void submitBotTurn()
        .catch((botError) => {
          console.warn('Bot turn failed', botError);
        })
        .finally(() => {
          setBotThinking(false);
        });
    }, delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentPlayerId, gameId, moveCount, shouldExecuteBotTurn, submitBotTurn]);

  const handlePlayCard = async (cardId: string) => {
    if (!state || !localPlayerId) return;
    const card = localHand.find((item) => item.id === cardId);
    if (!card) return;

    const move: MoveInput = {
      type: 'play',
      playerId: localPlayerId,
      cardId,
      whotCall: card.shape === 'whot' ? 'circle' : undefined,
    };

    try {
      await submitMove(move);
    } catch (submitError) {
      Alert.alert('Move failed', String(submitError));
    }
  };

  const handleDraw = async () => {
    if (!state || !localPlayerId) return;

    try {
      await submitMove({
        type: 'pick',
        playerId: localPlayerId,
      });
    } catch (submitError) {
      Alert.alert('Draw failed', String(submitError));
    }
  };

  if (!gameId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.deepNavy, padding: 24 }}>
        <Text style={{ color: colors.warmWhite, fontSize: 20, fontWeight: '700' }}>
          Invalid game route
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.deepNavy }}>
        <ActivityIndicator size="large" color={colors.electricBlue} />
        <Text style={{ color: colors.warmWhite, marginTop: 16 }}>Loading game...</Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.deepNavy, padding: 24 }}>
        <Text style={{ color: colors.gold, fontSize: 24, fontWeight: '800' }}>Active table</Text>
        <Text style={{ color: colors.warmWhite, marginTop: 12 }}>No live game found for this table.</Text>
        <Pressable
          onPress={() => router.push('/(tabs)')}
          style={{
            marginTop: 24,
            backgroundColor: colors.electricBlue,
            borderRadius: 16,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.deepNavy, fontWeight: '700' }}>Back to Lobby</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.deepNavy }} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: colors.gold, fontSize: 14, fontWeight: '700' }}>Game Table</Text>
        <Text style={{ color: colors.warmWhite, fontSize: 28, fontWeight: '800', marginTop: 8 }}>
          {gameId}
        </Text>
        <Text style={{ color: colors.electricBlue, marginTop: 10, fontSize: 14 }}>
          {state.status === 'finished'
            ? 'Game finished'
            : isLocalTurn
            ? 'Your turn'
            : botThinking
            ? 'Opponent thinking...'
            : `Waiting on ${state.currentPlayerId}`}
        </Text>
      </View>

      <View style={{ marginBottom: 22 }}>
        <Text style={{ color: colors.warmWhite, fontWeight: '700', marginBottom: 10 }}>Top card</Text>
        {state.pile.length > 0 ? (
          <GameCard card={state.pile[state.pile.length - 1]!} />
        ) : (
          <Text style={{ color: colors.electricBlue }}>No pile yet</Text>
        )}
      </View>

      <View style={{ marginBottom: 22 }}>
        <Text style={{ color: colors.warmWhite, fontWeight: '700', marginBottom: 10 }}>Players</Text>
        <FlatList
          data={state.players}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 10,
                padding: 14,
                backgroundColor: colors.darkSurface,
                borderRadius: 16,
                borderColor: item.id === currentPlayerId ? colors.gold : colors.deepNavy,
                borderWidth: 1,
              }}
            >
              <Text style={{ color: colors.warmWhite, fontWeight: '700' }}>{item.id}</Text>
              <Text style={{ color: colors.electricBlue, marginTop: 4 }}>
                Seat {item.seatNumber + 1} · Player
              </Text>
              {item.id === currentPlayerId ? (
                <Text style={{ color: colors.vibrantGreen, marginTop: 6 }}>Current turn</Text>
              ) : null}
            </View>
          )}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.warmWhite, fontWeight: '700', marginBottom: 10 }}>Your hand</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {localHand.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => handlePlayCard(card.id)}
              disabled={!isLocalTurn || !playableCards.some((c) => c.id === card.id)}
            >
              <GameCard
                card={card}
                selected={playableCards.some((c) => c.id === card.id)}
                disabled={!isLocalTurn || !playableCards.some((c) => c.id === card.id)}
              />
            </Pressable>
          ))}
        </ScrollView>
        <Text style={{ color: colors.electricBlue, fontSize: 12 }}>
          {localPlayerId ? 'Tap a playable card to submit your move.' : 'Sign in again to recover your seat.'}
        </Text>
      </View>

      {isLocalTurn ? (
        <Pressable
          onPress={handleDraw}
          style={{
            marginTop: 8,
            backgroundColor: colors.coralRed,
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.warmWhite, fontWeight: '700' }}>Draw from deck</Text>
        </Pressable>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: colors.warmWhite, fontWeight: '700', marginBottom: 10 }}>Reconnect</Text>
        <Text style={{ color: colors.electricBlue }}>{reconnectCountdownMs / 1000}s</Text>
      </View>

      {error ? (
        <View style={{ marginTop: 20, padding: 14, backgroundColor: colors.coralRed, borderRadius: 16 }}>
          <Text style={{ color: colors.warmWhite, fontWeight: '700' }}>Error</Text>
          <Text style={{ color: colors.warmWhite, marginTop: 6 }}>{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

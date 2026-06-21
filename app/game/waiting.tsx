import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brandImages } from '../../constants/images';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';

interface WaitingInfo {
  roomId: string;
  players: number;
  requiredPlayers: number;
  entryFeeKobo?: number;
}

interface JoinRoomWaitingResponse {
  roomId: string;
  status: 'waiting';
  players: number;
  requiredPlayers: number;
  entry_fee?: number;
  entryFee?: number;
}

interface JoinRoomGameResponse {
  gameId: string;
}

type JoinRoomResponse = JoinRoomWaitingResponse | JoinRoomGameResponse;

interface RoomPlayerRow {
  player_id: string;
}

interface GameRow {
  id: string;
  status: 'dealing' | 'active' | 'finished';
}

function isGameResponse(data: unknown): data is JoinRoomGameResponse {
  return typeof data === 'object' && data !== null && typeof (data as JoinRoomGameResponse).gameId === 'string';
}

function isWaitingResponse(data: unknown): data is JoinRoomWaitingResponse {
  const value = data as JoinRoomWaitingResponse;
  return (
    typeof data === 'object' &&
    data !== null &&
    value.status === 'waiting' &&
    typeof value.roomId === 'string'
  );
}

function getFriendlyError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function WaitingRoomScreen() {
  const { roomLevel } = useLocalSearchParams<{ roomLevel: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [waitingInfo, setWaitingInfo] = useState<WaitingInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const clearPoll = () => {
    if (pollRef.current !== null) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const navigateToGame = useCallback(
    (gameId: string) => {
      clearPoll();
      router.replace(`/game/${gameId}`);
    },
    [router],
  );

  const refreshWaitingRoom = useCallback(
    async (roomId: string, fallback?: WaitingInfo) => {
      const [{ data: playerRows, error: playerError }, { data: gameRows, error: gameError }] = await Promise.all([
        supabase
          .from('room_players')
          .select('player_id')
          .eq('room_id', roomId),
        supabase
          .from('games')
          .select('id,status')
          .eq('room_id', roomId)
          .in('status', ['dealing', 'active'])
          .limit(1),
      ]);

      if (playerError || gameError) {
        throw playerError ?? gameError;
      }

      const activeGame = (gameRows as GameRow[] | null)?.[0];
      if (activeGame) {
        navigateToGame(activeGame.id);
        return;
      }

      setWaitingInfo({
        roomId,
        players: (playerRows as RoomPlayerRow[] | null)?.length ?? fallback?.players ?? 0,
        requiredPlayers: fallback?.requiredPlayers ?? 2,
        entryFeeKobo: fallback?.entryFeeKobo,
      });
      setLoading(false);
    },
    [navigateToGame],
  );

  const joinRoom = useCallback(async () => {
    if (!roomLevel) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('join-room', {
        method: 'POST',
        body: { roomLevel },
      });

      if (error) {
        throw error;
      }

      const response = data as JoinRoomResponse;

      if (isGameResponse(response)) {
        navigateToGame(response.gameId);
        return;
      }

      if (isWaitingResponse(response)) {
        const nextWaitingInfo = {
          roomId: response.roomId,
          players: Number(response.players ?? 0),
          requiredPlayers: Number(response.requiredPlayers ?? 0),
          entryFeeKobo: Number(response.entry_fee ?? response.entryFee ?? 0),
        };

        setWaitingInfo(nextWaitingInfo);
        await refreshWaitingRoom(response.roomId, nextWaitingInfo);

        clearPoll();
        pollRef.current = setInterval(() => {
          void refreshWaitingRoom(response.roomId, nextWaitingInfo).catch((refreshError) => {
            setErrorMessage(getFriendlyError(refreshError));
          });
        }, 5000) as unknown as number;
        return;
      }

      throw new Error('Unexpected join-room response');
    } catch (error) {
      const message = getFriendlyError(error);
      setErrorMessage(message);
      Alert.alert('Unable to join room', message);
      setLoading(false);
    }
  }, [navigateToGame, refreshWaitingRoom, roomLevel]);

  useEffect(() => {
    if (!roomLevel) return;
    void joinRoom();

    return () => {
      clearPoll();
    };
  }, [joinRoom, roomLevel]);

  useEffect(() => {
    if (!waitingInfo?.roomId) return undefined;

    const roomId = waitingInfo.roomId;
    const fallback = waitingInfo;
    const refresh = () => {
      void refreshWaitingRoom(roomId, fallback).catch((error) => {
        setErrorMessage(getFriendlyError(error));
      });
    };

    const gamesChannel = supabase
      .channel(`waiting-games-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `room_id=eq.${roomId}` },
        refresh,
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`waiting-room-players-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        refresh,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamesChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [refreshWaitingRoom, waitingInfo?.roomId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.deepNavy }}>
      <View
        style={{
          backgroundColor: colors.darkSurface,
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 28,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <Text style={{ color: colors.gold, fontSize: 14, fontWeight: '700' }}>
          Waiting Room
        </Text>
        <Text
          style={{
            color: colors.warmWhite,
            fontSize: 28,
            fontWeight: '800',
            marginTop: 10,
            lineHeight: 36,
          }}
        >
          {roomLevel ? `${roomLevel.toUpperCase()} room` : 'Connecting...'}
        </Text>
        <Text style={{ color: colors.electricBlue, marginTop: 12, fontSize: 14 }}>
          {loading ? 'Connecting you to the table…' : 'Waiting for the table to become ready.'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Image
          source={brandImages.mascotThinking}
          style={{
            width: '60%',
            height: 140,
            resizeMode: 'contain',
            alignSelf: 'center',
            marginTop: 16,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            backgroundColor: colors.deepNavy,
            borderWidth: 1,
            borderColor: colors.warmWhite,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <Text style={{ color: colors.warmWhite, fontSize: 18, fontWeight: '700' }}>
            Table Status
          </Text>
          <Text style={{ color: colors.electricBlue, marginTop: 8, fontSize: 16 }}>
            {roomLevel || 'Loading room...'}
          </Text>
          <Text style={{ color: colors.warmWhite, marginTop: 16, fontSize: 14 }}>
            {waitingInfo
              ? `${waitingInfo.players} of ${waitingInfo.requiredPlayers} players ready.`
              : 'Finding an available table...' }
          </Text>
          {waitingInfo?.entryFeeKobo != null ? (
            <Text style={{ color: colors.electricBlue, marginTop: 8, fontSize: 14 }}>
              Entry fee: {formatNaira(waitingInfo.entryFeeKobo)}
            </Text>
          ) : null}
          <Text style={{ color: colors.vibrantGreen, marginTop: 10, fontSize: 14 }}>
            {waitingInfo
              ? 'We will start the game automatically once enough players are seated.'
              : 'If bots are available for this room, your match may start immediately.'}
          </Text>
        </View>

        {loading ? (
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.electricBlue} />
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/(tabs)')}
            style={{
              marginTop: 24,
              backgroundColor: colors.electricBlue,
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={{ color: colors.deepNavy, fontWeight: '700' }}>Back to Lobby</Text>
          </Pressable>
        )}
        {errorMessage ? (
          <Text style={{ color: colors.coralRed, marginTop: 16 }}>{errorMessage}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

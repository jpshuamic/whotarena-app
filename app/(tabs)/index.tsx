import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { RoomCard } from '../../components/lobby/RoomCard';
import { STAKE_LEVELS } from '../../constants/stakes';
import { colors } from '../../constants/colors';

const VISIBLE_STAKES = Object.values(STAKE_LEVELS).filter(
  (stake) => stake.launchEnabled,
);

export default function LobbyScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.deepNavy }}>
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 20,
          backgroundColor: colors.darkSurface,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <Text style={{ color: colors.gold, fontSize: 14, fontWeight: '700' }}>
          WhotArena
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
          Pick a room and start playing.
        </Text>
        <Text style={{ color: colors.electricBlue, marginTop: 12, fontSize: 14 }}>
          Fast matchmaking, real stakes, bot-backed tables.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {VISIBLE_STAKES.map((stake) => (
          <RoomCard
            key={stake.id}
            label={stake.label}
            badge={stake.badge}
            entryFee={stake.entryFee}
            maxPlayers={stake.maxPlayers}
            botEnabled={stake.botEnabled}
            onPress={() => router.push(`/game/waiting?roomLevel=${stake.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

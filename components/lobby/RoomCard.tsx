import { Pressable, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';
interface RoomCardProps {
  label: string;
  badge: string;
  entryFee: number;
  maxPlayers: number;
  botEnabled: boolean;
  onPress: () => void;
}

export function RoomCard({
  label,
  badge,
  entryFee,
  maxPlayers,
  botEnabled,
  onPress,
}: RoomCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.darkSurface : colors.deepNavy,
        borderWidth: 1,
        borderColor: colors.warmWhite,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.gold, fontSize: 16, fontWeight: '700' }}>
          {label} · {badge}
        </Text>
        <Text style={{ color: colors.electricBlue, fontSize: 16, fontWeight: '700' }}>
          {formatNaira(entryFee)}
        </Text>
      </View>

      <Text style={{ color: colors.warmWhite, marginTop: 8, fontSize: 14 }}>
        {maxPlayers}-player room · {botEnabled ? 'Bot available' : 'Players only'}
      </Text>

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.electricBlue,
          borderRadius: 14,
          paddingVertical: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.deepNavy, fontWeight: '700' }}>Join Room</Text>
      </View>
    </Pressable>
  );
}

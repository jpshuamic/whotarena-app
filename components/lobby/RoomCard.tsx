import { Pressable, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';

interface RoomCardProps {
  label: string;
  badge: string;
  entryFee: number;
  maxPlayers: number;
  botEnabled: boolean;
  color: string;
  onPress: () => void;
}

function getJoinTextColor(hex: string): string {
  const raw = hex.replace('#', '');
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  // Standard luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#0D1B2A' : '#FFFFFF';
}

export function RoomCard({
  label,
  badge,
  entryFee,
  maxPlayers,
  botEnabled,
  color,
  onPress,
}: RoomCardProps) {
  const joinTextColor = getJoinTextColor(color);

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
          backgroundColor: color,
          borderRadius: 14,
          paddingVertical: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: joinTextColor, fontWeight: '700' }}>Join Room</Text>
      </View>
    </Pressable>
  );
}

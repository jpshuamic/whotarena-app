import { Text, View } from 'react-native';
import { colors, cardShapeColors } from '../../constants/colors';
import type { Card } from '../../types/game';

interface GameCardProps {
  card: Card;
  selected?: boolean;
  disabled?: boolean;
}

export function GameCard({ card, selected, disabled }: GameCardProps) {
  const backgroundColor = disabled
    ? colors.darkSurface
    : selected
    ? colors.electricBlue
    : colors.warmWhite;

  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor,
        borderWidth: 1,
        borderColor: selected ? colors.gold : colors.deepNavy,
        padding: 14,
        width: 96,
        minHeight: 110,
        marginRight: 12,
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: colors.deepNavy, fontSize: 12, fontWeight: '700' }}>
        {card.shape.toUpperCase()}
      </Text>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: cardShapeColors[card.shape] ?? colors.electricBlue,
        }}
      >
        <Text style={{ color: colors.warmWhite, fontSize: 28, fontWeight: '900' }}>
          {card.number}
        </Text>
      </View>
      <Text style={{ color: colors.deepNavy, fontSize: 12 }}>{card.id}</Text>
    </View>
  );
}

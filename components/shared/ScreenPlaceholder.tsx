import { Text, View } from 'react-native';
import { colors } from '../../constants/colors';

interface ScreenPlaceholderProps {
  screenNumber: number;
  title: string;
  section: string;
}

export function ScreenPlaceholder({
  screenNumber,
  title,
  section,
}: ScreenPlaceholderProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.deepNavy,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text style={{ color: colors.gold, fontSize: 14, marginBottom: 8 }}>
        {section}
      </Text>
      <Text
        style={{
          color: colors.warmWhite,
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Screen {screenNumber}: {title}
      </Text>
      <Text style={{ color: colors.electricBlue, marginTop: 12 }}>
        WhotArena — scaffold ready
      </Text>
    </View>
  );
}

import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const auth = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!phone) {
      Alert.alert('Missing phone number', 'Please return to the login screen and enter your phone number.');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Enter verification code', 'Please enter the code you received via SMS.');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.verifyOtp(phone, code.trim());
      if (response.error) {
        throw response.error;
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Verification failed', String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.deepNavy, padding: 24 }}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: colors.gold, fontSize: 14, fontWeight: '700', marginBottom: 12 }}>
          Verify phone number
        </Text>
        <Text style={{ color: colors.warmWhite, fontSize: 28, fontWeight: '800', marginBottom: 20 }}>
          Enter the code sent to {phone ?? 'your phone'}
        </Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder="123456"
          placeholderTextColor={colors.electricBlue}
          style={{
            color: colors.warmWhite,
            borderWidth: 1,
            borderColor: colors.electricBlue,
            borderRadius: 16,
            padding: 16,
            marginBottom: 18,
          }}
        />
        <Pressable
          onPress={handleVerify}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.vibrantGreen : colors.electricBlue,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          })}
        >
          <Text style={{ color: colors.deepNavy, fontWeight: '700' }}>
            {loading ? 'Verifying...' : 'Verify code'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('Enter phone number', 'Please enter your phone number to continue.');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.signInWithPhone(phone.trim());
      if (response.error) {
        throw response.error;
      }
      router.push({ pathname: '/(auth)/verify', params: { phone: phone.trim() } });
    } catch (error) {
      Alert.alert('Unable to send code', String(error));
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
          Sign in with phone
        </Text>
        <Text style={{ color: colors.warmWhite, fontSize: 28, fontWeight: '800', marginBottom: 20 }}>
          Enter your phone number
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+2348012345678"
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
          onPress={handleSendOtp}
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
            {loading ? 'Sending code...' : 'Send verification code'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

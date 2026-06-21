import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const auth = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

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
      style={styles.container}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </Pressable>

      <View style={styles.inner}>
        <Text style={styles.label}>Verify phone number</Text>
        <Text style={styles.heading}>
          Enter the code sent to {phone ?? 'your phone'}
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder="123456"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={[styles.otpInput, codeFocused && styles.otpInputFocused]}
          onFocus={() => setCodeFocused(true)}
          onBlur={() => setCodeFocused(false)}
        />

        <Pressable
          onPress={handleVerify}
          disabled={loading}
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify code'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepNavy,
    padding: 24,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  heading: {
    color: colors.warmWhite,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    lineHeight: 36,
  },
  otpInput: {
    backgroundColor: '#1A2B3C',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
  },
  otpInputFocused: {
    borderColor: '#1E90FF',
  },
  button: {
    backgroundColor: colors.electricBlue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

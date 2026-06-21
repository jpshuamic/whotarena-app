import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';

function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('234')) {
    return '+' + digits;
  }
  if (digits.startsWith('0')) {
    return '+234' + digits.slice(1);
  }
  return '+234' + digits;
}

export default function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('Enter phone number', 'Please enter your phone number to continue.');
      return;
    }

    const formatted = formatPhoneNumber(phone.trim());
    setLoading(true);
    try {
      const response = await auth.signInWithPhone(formatted);
      if (response.error) {
        throw response.error;
      }
      router.push({ pathname: '/(auth)/verify', params: { phone: formatted } });
    } catch (error) {
      Alert.alert('Unable to send code', String(error));
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
        <Text style={styles.label}>Sign in with phone</Text>
        <Text style={styles.heading}>Enter your phone number</Text>

        <View style={[styles.inputContainer, phoneFocused && styles.inputContainerFocused]}>
          <Ionicons
            name="call-outline"
            size={18}
            color="rgba(255,255,255,0.4)"
            style={styles.inputIcon}
          />
          <Text style={styles.flagText}>🇳🇬</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+2348012345678"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.input}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
          />
        </View>

        <Pressable
          onPress={handleSendOtp}
          disabled={loading}
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending code...' : 'Send verification code'}
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B3C',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  inputContainerFocused: {
    borderColor: '#1E90FF',
  },
  inputIcon: {
    marginRight: 10,
  },
  flagText: {
    fontSize: 16,
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
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

import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function RegisterScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Enter username', 'Please choose a username to continue.');
      return;
    }
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
      router.push({ pathname: '/(auth)/verify', params: { phone: formatted, username: username.trim() } });
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
      <View style={styles.inner}>
        <Text style={styles.label}>Create your account</Text>
        <Text style={styles.heading}>Sign Up</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          placeholderTextColor="rgba(255,255,255,0.4)"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+2348012345678"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.input}
        />

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? colors.vibrantGreen : colors.electricBlue, opacity: loading ? 0.6 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending code...' : 'Continue'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Already have an account? Sign In</Text>
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
  input: {
    color: colors.warmWhite,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    backgroundColor: colors.darkSurface,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.deepNavy,
    fontWeight: '700',
    fontSize: 16,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});

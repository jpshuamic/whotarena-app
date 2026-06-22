import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const auth = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Please return to the login screen and enter your email.');
      return;
    }
    if (!code.trim()) {
      Alert.alert('Enter verification code', 'Please enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.verifyEmailOtp(email, code.trim());
      if (response.error) throw response.error;

      const user = response.data.user;
      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').insert({
            id: user.id,
            username: user.email?.split('@')[0] ?? 'Player',
            real_balance: 0,
            bonus_balance: 100000,
            total_games: 0,
            total_wins: 0,
            win_rate: 0.0,
            is_bot: false,
            is_banned: false,
          });
        }
      }

      router.replace('/(tabs)/');
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
        <Text style={styles.label}>Verify your email</Text>
        <Text style={styles.heading}>We sent a 6-digit code to</Text>
        <Text style={styles.emailHighlight}>{email ?? 'your email'}</Text>
        <Text style={styles.subtext}>Check your inbox and enter it below. Check spam if you don't see it.</Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder="123456"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={[styles.otpInput, codeFocused && styles.otpInputFocused]}
          onFocus={() => setCodeFocused(true)}
          onBlur={() => setCodeFocused(false)}
          maxLength={6}
        />

        <Pressable
          onPress={handleVerify}
          disabled={loading}
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify code'}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.resendLink}>
          <Text style={styles.resendText}>Didn't get the code? Go back and resend</Text>
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
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
  },
  emailHighlight: {
    color: colors.electricBlue,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8,
  },
  subtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: '#1A2B3C',
    borderRadius: 12,
    height: 64,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  otpInputFocused: {
    borderColor: '#1E90FF',
  },
  button: {
    backgroundColor: colors.electricBlue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  resendLink: {
    alignItems: 'center',
  },
  resendText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});

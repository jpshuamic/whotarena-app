import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Enter username', 'Please choose a username to continue.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Enter email', 'Please enter your email address to continue.');
      return;
    }

    setLoading(true);
    try {
      const response = await auth.signInWithEmail(email.trim().toLowerCase());
      if (response.error) throw response.error;
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim().toLowerCase(), username: username.trim() } });
    } catch (error) {
      Alert.alert('Unable to send code', String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      await auth.signInWithOAuthProvider(provider);
      router.replace('/(tabs)');
    } catch {
      // dismissed
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
        <Text style={styles.label}>Create your account</Text>
        <Text style={styles.heading}>Sign Up</Text>

        <View style={[styles.inputContainer, usernameFocused && styles.inputContainerFocused]}>
          <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCapitalize="none"
            style={styles.input}
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
          />
        </View>

        <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
          <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your@email.com"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.input}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>{loading ? 'Sending code...' : 'Continue'}</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton} onPress={() => handleOAuth('google')}>
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.socialButtonText}>Google</Text>
          </Pressable>
          <Pressable style={styles.socialButton} onPress={() => handleOAuth('facebook')}>
            <FontAwesome name="facebook" size={20} color="#1877F2" />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </Pressable>
        </View>

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
    marginBottom: 14,
  },
  inputContainerFocused: {
    borderColor: '#1E90FF',
  },
  inputIcon: {
    marginRight: 10,
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
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    color: '#0D1B2A',
    fontWeight: '700',
    fontSize: 14,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});

import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii, FontSizes, ColorPalette } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthNavProp } from '@/navigation/types';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<AuthNavProp>();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try { const success = await login(email, password); if (!success) setError('Login failed.'); }
    catch { setError('Login failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.content}>
        <View style={s.logoContainer}>
          <LinearGradient colors={[colors.primary, colors.primaryDim]} style={s.logoGradient}>
            <Ionicons name="musical-notes" size={40} color={colors.onPrimaryFixed} />
          </LinearGradient>
          <Text style={s.appName}>Melody</Text>
          <Text style={s.tagline}>Your music, your vibe</Text>
        </View>

        <View style={s.form}>
          <View style={s.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.onSurfaceVariant} />
            <TextInput style={s.input} placeholder="Email address" placeholderTextColor={colors.onSurfaceVariant}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={s.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.onSurfaceVariant} />
            <TextInput style={s.input} placeholder="Password" placeholderTextColor={colors.onSurfaceVariant}
              value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={[colors.primary, colors.primaryContainer]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.loginButton}>
              {loading ? <ActivityIndicator color={colors.onPrimaryFixed} /> : <Text style={s.loginButtonText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.signupLink} onPress={() => navigation.navigate('Signup')}>
            <Text style={s.signupText}>Don't have an account? <Text style={s.signupHighlight}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing['3xl'] },
  logoContainer: { alignItems: 'center', marginBottom: Spacing['5xl'] },
  logoGradient: { width: 80, height: 80, borderRadius: Radii.xl, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  appName: { fontSize: FontSizes.headlineLg, fontWeight: '700', color: c.onSurface },
  tagline: { fontSize: FontSizes.bodyMd, color: c.onSurfaceVariant, marginTop: Spacing.xs },
  form: { gap: Spacing.lg },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surfaceContainer, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, height: 56, gap: Spacing.md },
  input: { flex: 1, color: c.onSurface, fontSize: FontSizes.bodyLg },
  error: { color: c.error, fontSize: FontSizes.labelMd, textAlign: 'center' },
  loginButton: { height: 56, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
  loginButtonText: { color: c.onPrimaryFixed, fontSize: FontSizes.titleMd, fontWeight: '700' },
  signupLink: { alignItems: 'center', marginTop: Spacing.md },
  signupText: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd },
  signupHighlight: { color: c.primary, fontWeight: '600' },
});

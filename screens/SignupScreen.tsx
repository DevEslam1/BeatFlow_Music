import { ColorPalette, FontSizes, Radii, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const success = await signup(name, email, password);
      if (!success) setError("Signup failed.");
    } catch {
      setError("Signup failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.content}>
        <TouchableOpacity
          style={s.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>

        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>
          Join GIG Music Player and start listening
        </Text>

        <View style={s.form}>
          <View style={s.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <TextInput
              style={s.input}
              placeholder="Full name"
              placeholderTextColor={colors.onSurfaceVariant}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={s.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <TextInput
              style={s.input}
              placeholder="Email address"
              placeholderTextColor={colors.onSurfaceVariant}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={colors.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity onPress={handleSignup} disabled={loading}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.signupButton}
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimaryFixed} />
              ) : (
                <Text style={s.signupButtonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.loginText}>
              Already have an account?{" "}
              <Text style={s.loginHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: ColorPalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing["3xl"],
    },
    backButton: { position: "absolute", top: 60, left: 24 },
    title: {
      fontSize: FontSizes.headlineLg,
      fontWeight: "700",
      color: c.onSurface,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: FontSizes.bodyLg,
      color: c.onSurfaceVariant,
      marginBottom: Spacing["4xl"],
    },
    form: { gap: Spacing.lg },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surfaceContainer,
      borderRadius: Radii.md,
      paddingHorizontal: Spacing.lg,
      height: 56,
      gap: Spacing.md,
    },
    input: { flex: 1, color: c.onSurface, fontSize: FontSizes.bodyLg },
    error: { color: c.error, fontSize: FontSizes.labelMd, textAlign: "center" },
    signupButton: {
      height: 56,
      borderRadius: Radii.full,
      justifyContent: "center",
      alignItems: "center",
      marginTop: Spacing.sm,
    },
    signupButtonText: {
      color: c.onPrimaryFixed,
      fontSize: FontSizes.titleMd,
      fontWeight: "700",
    },
    loginLink: { alignItems: "center", marginTop: Spacing.md },
    loginText: { color: c.onSurfaceVariant, fontSize: FontSizes.bodyMd },
    loginHighlight: { color: c.primary, fontWeight: "600" },
  });

import React from 'react';
import { StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '@/contexts/NetworkContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './themed-text';

const { width } = Dimensions.get('window');

export const NetworkStatusBanner = () => {
  const { isConnected } = useNetwork();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (isConnected) return null;

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={[
        styles.container,
        {
          top: insets.top + 10,
          backgroundColor: colors.surfaceContainerHighest,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        <ThemedText style={styles.text} type="defaultSemiBold">Connecting...</ThemedText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: width * 0.2,
    right: width * 0.2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    // Add shadow for better visibility on top of content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    fontSize: 13,
  },
});

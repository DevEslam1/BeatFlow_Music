import React from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Radii } from '@/constants/theme';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteIcon?: keyof typeof Ionicons.glyphMap;
}

export default function SwipeableItem({
  children,
  onDelete,
  deleteIcon = 'trash-outline',
}: SwipeableItemProps) {
  const { colors } = useTheme();

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Note: react-native-gesture-handler Swipeable actions are slightly different 
    // depending on the version. We'll use the basic version first.
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.error }]}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDelete();
        }}
      >
        <Ionicons name={deleteIcon} size={24} color={colors.onError} />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      onSwipeableWillOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md,
    marginVertical: 4,
    marginRight: Spacing.lg,
  },
});

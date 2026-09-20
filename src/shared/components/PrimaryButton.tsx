import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { useAppTheme } from '../theme/useAppTheme';
import { AppText } from './AppText';

interface PrimaryButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  loading?: boolean;
}

export function PrimaryButton({ label, loading = false, disabled, style, ...props }: PrimaryButtonProps) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.colors.primary, borderRadius: theme.radius.sm },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}>
      {loading ? (
        <>
          <ActivityIndicator color={theme.colors.primaryText} />
          <AppText style={{ color: theme.colors.primaryText }} weight="bold">保存中…</AppText>
        </>
      ) : (
        <AppText style={{ color: theme.colors.primaryText }} weight="bold">{label}</AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  disabled: { opacity: 0.58 },
  pressed: { opacity: 0.82 },
});

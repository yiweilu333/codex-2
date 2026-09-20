import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '../theme/useAppTheme';
import { AppText } from './AppText';

interface NumericFieldProps extends Omit<TextInputProps, 'keyboardType'> {
  label: string;
  unit?: string;
  error?: string;
  integer?: boolean;
}

export function NumericField({ label, unit, error, integer = false, style, ...props }: NumericFieldProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.wrapper}>
      <AppText tone="muted" style={styles.label}>{label}</AppText>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.sm,
          },
        ]}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          keyboardType={integer ? 'number-pad' : 'decimal-pad'}
          placeholderTextColor={theme.colors.muted}
          selectionColor={theme.colors.primary}
          style={[styles.input, { color: theme.colors.text }, style]}
        />
        {unit ? <AppText tone="muted">{unit}</AppText> : null}
      </View>
      {error ? <AppText tone="danger" style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 12 },
  inputRow: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    minHeight: 48,
    flex: 1,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    paddingVertical: 0,
  },
  error: { fontSize: 12 },
});

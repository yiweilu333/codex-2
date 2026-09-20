import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '../theme/useAppTheme';

export interface AppTextProps extends TextProps {
  tone?: 'default' | 'muted' | 'primary' | 'danger';
  weight?: 'regular' | 'medium' | 'bold';
}

export function AppText({ tone = 'default', weight = 'regular', style, ...props }: AppTextProps) {
  const theme = useAppTheme();
  const color = {
    default: theme.colors.text,
    muted: theme.colors.muted,
    primary: theme.colors.primary,
    danger: theme.colors.danger,
  }[tone];

  return (
    <Text
      {...props}
      style={[styles.base, { color }, styles[weight], style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { fontSize: 16 },
  regular: { fontWeight: '400' },
  medium: { fontWeight: '600' },
  bold: { fontWeight: '800' },
});

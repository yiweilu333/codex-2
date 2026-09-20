import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText weight="bold" style={styles.title}>{title}</AppText>
      <AppText tone="muted" style={styles.message}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontSize: 18 },
  message: { textAlign: 'center', lineHeight: 21 },
});

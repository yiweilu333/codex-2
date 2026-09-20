import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/shared/components/AppText';

export default function DashboardRoute() {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Forge Fit</AppText>
      <AppText>开始记录你的下一次训练。</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

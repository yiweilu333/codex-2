import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="training" options={{ title: '训练' }} />
      <Tabs.Screen name="start" options={{ title: '开始' }} />
      <Tabs.Screen name="analysis" options={{ title: '分析' }} />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}

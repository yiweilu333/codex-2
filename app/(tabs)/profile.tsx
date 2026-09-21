import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';

export default function ProfileRoute() {
  return (
    <Screen contentStyle={{ paddingTop: 32 }}>
      <AppText weight="bold" style={{ fontSize: 28 }}>我的</AppText>
      <Card style={{ gap: 8 }}>
        <AppText weight="bold">本地优先</AppText>
        <AppText tone="muted">训练数据只保存在此设备的 SQLite 数据库中。</AppText>
      </Card>
      <Card style={{ gap: 8 }}>
        <AppText weight="bold">即将推出</AppText>
        <AppText tone="muted">身体数据、训练计划与 AI 训练助手将在后续阶段加入。</AppText>
      </Card>
    </Screen>
  );
}

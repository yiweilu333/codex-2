import { AppText } from '@/src/shared/components/AppText';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';

export default function AnalysisRoute() {
  return (
    <Screen contentStyle={{ paddingTop: 32 }}>
      <AppText weight="bold" style={{ fontSize: 28 }}>数据分析</AppText>
      <Card style={{ gap: 8 }}>
        <AppText weight="bold">第二阶段开放</AppText>
        <AppText tone="muted">力量趋势、训练容量和 PR 将基于真实训练数据生成。</AppText>
      </Card>
    </Screen>
  );
}

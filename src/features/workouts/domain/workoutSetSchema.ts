import { z } from 'zod';

const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < Number.EPSILON * 100;

export const completableSetSchema = z.object({
  weightKg: z
    .number({ error: '请输入重量' })
    .min(0, '重量不能小于 0')
    .refine(hasAtMostTwoDecimals, '重量最多保留两位小数'),
  reps: z
    .number({ error: '请输入次数' })
    .int('次数必须是整数')
    .min(0, '次数不能小于 0'),
});

export type CompletableSet = z.infer<typeof completableSetSchema>;

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { z } from 'zod';

import type { ExerciseService } from '../application/ExerciseService';
import type { Equipment, MuscleGroup } from '../domain/exercise';
import { AppText } from '@/src/shared/components/AppText';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { Screen } from '@/src/shared/components/Screen';
import { useAppTheme } from '@/src/shared/theme/useAppTheme';

const formSchema = z.object({
  name: z.string().trim().min(1, '请输入动作名称'),
  notes: z.string(),
  defaultRestSeconds: z.string().regex(/^\d+$/, '请输入有效休息秒数'),
});

type FormValues = z.infer<typeof formSchema>;

const muscleOptions: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背' },
  { value: 'shoulders', label: '肩' },
  { value: 'legs', label: '腿' },
  { value: 'arms', label: '手臂' },
  { value: 'core', label: '核心' },
];

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: '杠铃' },
  { value: 'dumbbell', label: '哑铃' },
  { value: 'cable', label: '绳索' },
  { value: 'machine', label: '器械' },
  { value: 'bodyweight', label: '自重' },
  { value: 'other', label: '其他' },
];

interface ExerciseFormScreenProps {
  service: ExerciseService;
  exerciseId?: string;
  onSaved?: () => void;
  onArchived?: () => void;
}

export function ExerciseFormScreen({
  service,
  exerciseId,
  onSaved,
  onArchived,
}: ExerciseFormScreenProps) {
  const theme = useAppTheme();
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('chest');
  const [equipment, setEquipment] = useState<Equipment>('cable');
  const [success, setSuccess] = useState(false);
  const [custom, setCustom] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', notes: '', defaultRestSeconds: '90' },
  });

  useEffect(() => {
    if (!exerciseId) return;
    void service.getById(exerciseId).then((exercise) => {
      if (!exercise) return;
      reset({
        name: exercise.name,
        notes: exercise.notes ?? '',
        defaultRestSeconds: String(exercise.defaultRestSeconds),
      });
      setMuscleGroup(exercise.muscleGroup);
      setEquipment(exercise.equipment);
      setCustom(exercise.isCustom);
    });
  }, [exerciseId, reset, service]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSuccess(false);
    try {
      const input = {
        name: values.name,
        muscleGroup,
        movementType: 'isolation' as const,
        equipment,
        defaultRestSeconds: Number(values.defaultRestSeconds),
        notes: values.notes || null,
      };
      if (exerciseId) await service.update(exerciseId, input);
      else await service.create(input);
      setSuccess(true);
      onSaved?.();
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : '保存动作失败');
    }
  });

  return (
    <Screen>
      <View style={styles.heading}>
        <AppText weight="bold" style={styles.title}>{exerciseId ? '编辑动作' : '自定义动作'}</AppText>
        <AppText tone="muted">动作会保存在本机，可用于任意训练。</AppText>
      </View>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <View style={styles.field}>
            <AppText tone="muted">动作名称</AppText>
            <TextInput
              accessibilityLabel="动作名称"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="例如：绳索夹胸"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: errors.name ? theme.colors.danger : theme.colors.border }]}
            />
            {errors.name ? <AppText tone="danger">{errors.name.message}</AppText> : null}
          </View>
        )}
      />
      <Selector<MuscleGroup> label="训练部位" value={muscleGroup} options={muscleOptions} onChange={setMuscleGroup} />
      <Selector<Equipment> label="器械" value={equipment} options={equipmentOptions} onChange={setEquipment} />
      <Controller
        control={control}
        name="defaultRestSeconds"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <AppText tone="muted">默认休息时间（秒）</AppText>
            <TextInput
              accessibilityLabel="默认休息时间"
              keyboardType="number-pad"
              value={value}
              onChangeText={onChange}
              style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: errors.defaultRestSeconds ? theme.colors.danger : theme.colors.border }]}
            />
          </View>
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <View style={styles.field}>
            <AppText tone="muted">备注</AppText>
            <TextInput
              accessibilityLabel="备注"
              multiline
              value={value}
              onChangeText={onChange}
              placeholder="例如：注意顶峰收缩"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, styles.notes, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            />
          </View>
        )}
      />
      {submitError ? <AppText tone="danger">{submitError}</AppText> : null}
      {success ? <AppText tone="primary">动作已保存</AppText> : null}
      <PrimaryButton label="保存动作" loading={isSubmitting} onPress={() => void submit()} />
      {exerciseId && custom ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void service.archive(exerciseId).then(onArchived)}
          style={styles.archive}>
          <AppText tone="danger" weight="bold">归档动作</AppText>
        </Pressable>
      ) : null}
    </Screen>
  );
}

function Selector<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange(value: T): void;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.field}>
      <AppText tone="muted">{label}</AppText>
      <View style={styles.optionRow}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                },
              ]}>
              <AppText style={{ color: selected ? theme.colors.primaryText : theme.colors.text }}>{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 4 },
  title: { fontSize: 28 },
  field: { gap: 7 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 16 },
  notes: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, minWidth: 60, paddingHorizontal: 14, borderWidth: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  archive: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});

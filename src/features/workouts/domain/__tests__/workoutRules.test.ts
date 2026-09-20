import {
  canFinishWorkout,
  parseNumericInput,
  validateCompletableSet,
} from '../workoutRules';

describe('workoutRules', () => {
  it('accepts a completed bodyweight set at zero kilograms', () => {
    expect(validateCompletableSet({ weightKg: 0, reps: 10 })).toEqual({
      weightKg: 0,
      reps: 10,
    });
  });

  it.each([
    [{ weightKg: -1, reps: 10 }, '重量不能小于 0'],
    [{ weightKg: 80, reps: 2.5 }, '次数必须是整数'],
    [{ weightKg: 80, reps: undefined }, '请输入次数'],
    [{ weightKg: 82.555, reps: 8 }, '重量最多保留两位小数'],
  ])('rejects invalid completed set %o', (input, message) => {
    expect(() => validateCompletableSet(input)).toThrow(message);
  });

  it('parses decimal input and treats blank input as missing', () => {
    expect(parseNumericInput('82.5')).toBe(82.5);
    expect(parseNumericInput('  ')).toBeUndefined();
  });

  it('requires at least one completed set before finishing', () => {
    expect(canFinishWorkout({ workoutExercises: [] })).toBe(false);
  });

  it('allows finishing when any exercise contains a completed set', () => {
    expect(
      canFinishWorkout({
        workoutExercises: [
          {
            sets: [
              {
                isCompleted: true,
              },
            ],
          },
        ],
      }),
    ).toBe(true);
  });
});

# Forge Fit MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Expo mobile MVP that persists exercises and complete workout sessions locally, restores interrupted sessions, and shows accurate workout history.

**Architecture:** Expo Router screens call focused application use cases through typed repository interfaces. Zustand mirrors the active workout for responsive editing, while an Expo SQLite adapter is the persistent source of truth and all completed-set or completed-workout writes are transactional.

**Tech Stack:** React Native, Expo, Expo Router, TypeScript strict mode, expo-sqlite, expo-crypto, Zustand, Zod, React Hook Form, Jest, jest-expo, React Native Testing Library, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-20-forge-fit-mvp-design.md`

## Global Constraints

- The application must run on both iOS and Android through Expo.
- All MVP data is stored locally in SQLite and all MVP features work offline.
- TypeScript runs in strict mode.
- UI follows the approved Midnight Black + Health Blue semantic theme and the system light/dark preference.
- Minimum touch target is 48 × 48 dp.
- Business identifiers are UUID strings; persisted dates are ISO 8601 UTC strings; persisted weight is kilograms.
- Screens never execute SQL directly; use cases depend on repository interfaces.
- The MVP includes the full user-specified list of 17 built-in exercises.
- The active workout is recoverable after backgrounding or process termination.
- Charts, PR detection, workout plans, progressive overload, body measurements, AI, accounts, and cloud sync remain out of scope.

## Review Focus

- Repeated application startup must run migrations and seeding without duplicate exercises; Task 3 pins this with idempotency tests.
- A set with `0 kg` is valid, while negative weight, fractional reps, and completing blank fields are rejected; Task 2 pins these validation boundaries.
- Renaming or archiving a custom exercise must not alter stored workout snapshots; Tasks 3 and 8 pin historical immutability.
- Backgrounding during a partially typed set must flush pending edits, and relaunch must offer the exact active draft; Tasks 5 and 7 pin recovery behavior.
- Completing a workout must be atomic: either the completed status and all sets persist together or none of them do; Task 5 pins transaction rollback behavior.

---

### Task 1: Expo foundation and automated quality gates

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `eslint.config.js`
- Create: `jest.config.js`
- Create: `jest.setup.ts`
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `src/shared/components/AppText.tsx`
- Test: `src/shared/components/__tests__/AppText.test.tsx`

**Interfaces:**
- Consumes: None.
- Produces: Expo Router entry points, the `test`, `typecheck`, and `lint` scripts, and `AppText(props: TextProps)` for all feature screens.

- [ ] **Step 1: Create the Expo Router TypeScript scaffold and install dependencies**

Run the official Expo scaffold in a temporary child directory, copy its non-generated project files into the repository, then install `expo-sqlite`, `expo-crypto`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`, `jest-expo`, `@testing-library/react-native`, and `@types/jest`. Preserve the existing `.git`, `docs`, `.gitignore`, and `README.md`.

- [ ] **Step 2: Write the failing renderer test**

```tsx
import { render, screen } from '@testing-library/react-native';
import { AppText } from '../AppText';

it('renders readable body copy', () => {
  render(<AppText>开始训练</AppText>);
  expect(screen.getByText('开始训练')).toBeTruthy();
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run: `npm test -- AppText.test.tsx --runInBand`

Expected: FAIL because `AppText` does not exist.

- [ ] **Step 4: Implement the minimal shared text component and root layouts**

```tsx
import { Text, type TextProps } from 'react-native';

export function AppText(props: TextProps) {
  return <Text {...props} />;
}
```

Configure the root `Stack` and tab navigator with 首页、训练、分析、我的 routes and a centered workout action route. Add the exact scripts:

```json
{
  "test": "jest",
  "typecheck": "tsc --noEmit",
  "lint": "expo lint"
}
```

- [ ] **Step 5: Verify GREEN and all quality commands**

Run: `npm test -- AppText.test.tsx --runInBand`, `npm run typecheck`, and `npm run lint`.

Expected: the test passes and both static checks exit 0.

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json package-lock.json app.json tsconfig.json eslint.config.js jest.config.js jest.setup.ts app src/shared/components
git commit -m "chore: scaffold Expo fitness app"
```

### Task 2: Domain model and training input validation

**Files:**
- Create: `src/features/exercises/domain/exercise.ts`
- Create: `src/features/workouts/domain/workout.ts`
- Create: `src/features/workouts/domain/workoutSetSchema.ts`
- Create: `src/features/workouts/domain/workoutRules.ts`
- Create: `src/test/fixtures.ts`
- Test: `src/features/workouts/domain/__tests__/workoutRules.test.ts`

**Interfaces:**
- Consumes: Zod.
- Produces: `Exercise`, `Workout`, `WorkoutExercise`, `WorkoutSet`, `WorkoutStatus`, `SetType`, `parseNumericInput(value)`, `validateCompletableSet(set)`, and `canFinishWorkout(workout)`.

- [ ] **Step 1: Write failing validation tests**

```ts
import { canFinishWorkout, validateCompletableSet } from '../workoutRules';

it('accepts a completed bodyweight set at zero kilograms', () => {
  expect(validateCompletableSet({ weightKg: 0, reps: 10 })).toEqual({ weightKg: 0, reps: 10 });
});

it.each([
  [{ weightKg: -1, reps: 10 }, '重量不能小于 0'],
  [{ weightKg: 80, reps: 2.5 }, '次数必须是整数'],
  [{ weightKg: 80, reps: undefined }, '请输入次数'],
])('rejects invalid completed set %o', (input, message) => {
  expect(() => validateCompletableSet(input)).toThrow(message);
});

it('requires at least one completed set before finishing', () => {
  expect(canFinishWorkout({ workoutExercises: [] })).toBe(false);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- workoutRules.test.ts --runInBand`

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 3: Implement strict domain types and Zod schemas**

Define UUID and ISO date string aliases, the four workout statuses, the four set types, and the normalized exercise/workout shapes. Implement a Zod schema where `weightKg` is non-negative with at most two decimals and `reps` is a non-negative integer. Map Zod issues to the Chinese messages asserted above.

Create shared test fixtures with concrete values so later tests do not depend on undeclared helpers:

```ts
export const fixedNow = '2026-09-20T12:00:00.000Z';

export const barbellBench: Exercise = {
  id: 'seed.exercise.barbell-bench-press',
  name: '杠铃卧推',
  muscleGroup: 'chest',
  movementType: 'compound',
  equipment: 'barbell',
  defaultRestSeconds: 120,
  notes: null,
  isCustom: false,
  createdAt: fixedNow,
  updatedAt: fixedNow,
  archivedAt: null,
};

export const dumbbellBench = { ...barbellBench, id: 'seed.exercise.dumbbell-bench-press', name: '哑铃卧推', equipment: 'dumbbell' };
export const barbellRow = { ...barbellBench, id: 'seed.exercise.barbell-row', name: '杠铃划船', muscleGroup: 'back' };

export function customExercise(name: string): NewExercise {
  return { name, muscleGroup: 'chest', movementType: 'isolation', equipment: 'cable', defaultRestSeconds: 90, notes: null };
}
```

- [ ] **Step 4: Verify GREEN and the complete suite**

Run: `npm test -- workoutRules.test.ts --runInBand` and `npm test -- --runInBand`.

Expected: all tests pass.

- [ ] **Step 5: Commit the domain layer**

```bash
git add src/features/exercises/domain src/features/workouts/domain
git commit -m "feat: define workout domain rules"
```

### Task 3: SQLite migrations, seed data, and repository contracts

**Files:**
- Create: `src/db/types.ts`
- Create: `src/db/migrations/001_initial.ts`
- Create: `src/db/migrate.ts`
- Create: `src/db/client.ts`
- Create: `src/db/seed/exercises.ts`
- Create: `src/features/exercises/data/ExerciseRepository.ts`
- Create: `src/features/exercises/data/InMemoryExerciseRepository.ts`
- Create: `src/features/exercises/data/SQLiteExerciseRepository.ts`
- Create: `src/features/workouts/data/WorkoutRepository.ts`
- Create: `src/features/workouts/data/InMemoryWorkoutRepository.ts`
- Create: `src/features/workouts/data/SQLiteWorkoutRepository.ts`
- Test: `src/db/__tests__/migrate.test.ts`
- Test: `src/features/exercises/data/__tests__/ExerciseRepository.contract.test.ts`
- Test: `src/features/workouts/data/__tests__/WorkoutRepository.contract.test.ts`

**Interfaces:**
- Consumes: domain models from Task 2 and `SQLiteDatabase` from expo-sqlite.
- Produces: `openAppDatabase()`, `migrateDatabase(db)`, `seedExercises(repository)`, `ExerciseRepository`, and `WorkoutRepository` interfaces with in-memory and SQLite implementations.

- [ ] **Step 1: Write the failing seed idempotency and repository contract tests**

```ts
it('seeds the full list once across repeated startup', async () => {
  const repository = new InMemoryExerciseRepository();
  await seedExercises(repository);
  await seedExercises(repository);
  expect(await repository.list({ includeArchived: false })).toHaveLength(17);
});

it('keeps a workout exercise snapshot after archiving its source', async () => {
  const exercises = new InMemoryExerciseRepository();
  const workouts = new InMemoryWorkoutRepository();
  const exercise = await exercises.create(customExercise('绳索夹胸'));
  const workout = await workouts.start('胸部训练', fixedNow);
  await workouts.addExercise(workout.id, exercise);
  await exercises.archive(exercise.id, fixedNow);
  expect((await workouts.getById(workout.id))?.workoutExercises[0].exerciseNameSnapshot).toBe('绳索夹胸');
});
```

- [ ] **Step 2: Run repository tests and verify RED**

Run: `npm test -- Repository.contract.test.ts --runInBand`

Expected: FAIL because repositories and seed data do not exist.

- [ ] **Step 3: Implement migration 001 and the 17 deterministic seed rows**

The migration creates `app_meta`, `exercises`, `workouts`, `workout_exercises`, and `workout_sets`, enables foreign keys, applies all CHECK constraints from the spec, creates the four approved indexes, and records migration version `1` in the same transaction.

Use deterministic IDs in the form `seed.exercise.barbell-bench-press`, and use `INSERT OR IGNORE` so startup is idempotent.

- [ ] **Step 4: Implement repository interfaces and adapters**

```ts
export interface ExerciseRepository {
  list(filter?: { query?: string; muscleGroup?: string; includeArchived?: boolean }): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  create(input: NewExercise): Promise<Exercise>;
  update(id: string, input: UpdateExercise): Promise<Exercise>;
  archive(id: string, archivedAt: string): Promise<void>;
  upsertBuiltIns(exercises: Exercise[]): Promise<void>;
}
```

```ts
export interface WorkoutRepository {
  start(title: string, startedAt: string): Promise<Workout>;
  getActive(): Promise<Workout | null>;
  getById(id: string): Promise<Workout | null>;
  listCompleted(): Promise<WorkoutSummary[]>;
  addExercise(workoutId: string, exercise: Exercise): Promise<WorkoutExercise>;
  reorderExercises(workoutId: string, orderedIds: string[]): Promise<void>;
  saveSet(input: SaveWorkoutSetInput): Promise<WorkoutSet>;
  removeSet(id: string): Promise<void>;
  finish(workoutId: string, endedAt: string): Promise<Workout>;
  discard(workoutId: string, discardedAt: string): Promise<void>;
}
```

- [ ] **Step 5: Verify migration, idempotency, cascade, and snapshot tests**

Run: `npm test -- migrate.test.ts Repository.contract.test.ts --runInBand` and `npm test -- --runInBand`.

Expected: all contract cases pass for the in-memory adapters; SQL statement tests confirm every table, index, constraint, and transaction boundary.

- [ ] **Step 6: Commit persistence**

```bash
git add src/db src/features/exercises/data src/features/workouts/data
git commit -m "feat: add local fitness database"
```

### Task 4: Theme system and reusable mobile controls

**Files:**
- Create: `src/shared/theme/tokens.ts`
- Create: `src/shared/theme/useAppTheme.ts`
- Create: `src/shared/components/Screen.tsx`
- Create: `src/shared/components/Card.tsx`
- Create: `src/shared/components/PrimaryButton.tsx`
- Create: `src/shared/components/NumericField.tsx`
- Create: `src/shared/components/EmptyState.tsx`
- Test: `src/shared/components/__tests__/PrimaryButton.test.tsx`
- Test: `src/shared/components/__tests__/NumericField.test.tsx`

**Interfaces:**
- Consumes: React Native `useColorScheme` and Task 1 `AppText`.
- Produces: semantic `AppTheme`, reusable layout and input primitives with 48 dp touch targets.

- [ ] **Step 1: Write failing component behavior tests**

```tsx
it('uses a numeric keyboard and reports decimal input', () => {
  const onChange = jest.fn();
  render(<NumericField label="重量" value="" onChangeText={onChange} />);
  expect(screen.getByLabelText('重量')).toHaveProp('keyboardType', 'decimal-pad');
  fireEvent.changeText(screen.getByLabelText('重量'), '82.5');
  expect(onChange).toHaveBeenCalledWith('82.5');
});

it('disables the primary action while saving', () => {
  render(<PrimaryButton label="完成训练" loading onPress={jest.fn()} />);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- NumericField.test.tsx PrimaryButton.test.tsx --runInBand`

Expected: FAIL because the controls do not exist.

- [ ] **Step 3: Implement approved theme tokens and controls**

Dark tokens include background `#0D1117`, card `#171E27`, primary `#65AFFF`, text `#F6F8FA`, and muted text `#929EAD`. Every component consumes semantic tokens and provides accessibility labels and minimum dimensions.

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm test -- --runInBand`, `npm run typecheck`, and `npm run lint`.

```bash
git add src/shared
git commit -m "feat: add accessible fitness theme"
```

### Task 5: Active workout application use cases and recoverable store

**Files:**
- Create: `src/features/workouts/application/WorkoutService.ts`
- Create: `src/features/workouts/application/workoutFactory.ts`
- Create: `src/stores/activeWorkoutStore.ts`
- Test: `src/features/workouts/application/__tests__/WorkoutService.test.ts`
- Test: `src/stores/__tests__/activeWorkoutStore.test.ts`

**Interfaces:**
- Consumes: `WorkoutRepository`, `ExerciseRepository`, domain validation, a `Clock` returning ISO strings, and an `IdGenerator`.
- Produces: `WorkoutService.start`, `resume`, `addExercises`, `completeSet`, `flushDraft`, `finish`, and `discard`; `useActiveWorkoutStore` exposes UI-safe actions.

- [ ] **Step 1: Write failing recovery and atomic completion tests**

```ts
it('restores the exact active draft after a new service instance starts', async () => {
  const repository = new InMemoryWorkoutRepository();
  const first = makeService(repository);
  const workout = await first.start('胸部训练');
  await first.saveDraftSet(workout.id, exerciseId, { setIndex: 1, weightKg: 80, reps: 8 });
  const second = makeService(repository);
  expect((await second.resume())?.workoutExercises[0].sets[0]).toMatchObject({ weightKg: 80, reps: 8 });
});

it('leaves the workout active when the finish transaction fails', async () => {
  const repository = new FailingFinishWorkoutRepository();
  const service = makeService(repository);
  const workout = await createWorkoutWithCompletedSet(service);
  await expect(service.finish(workout.id)).rejects.toThrow('保存失败');
  expect((await repository.getById(workout.id))?.status).toBe('in_progress');
});
```

The test file defines its clock and helper explicitly:

```ts
const exerciseId = 'seed.exercise.barbell-bench-press';
const clock = { now: () => fixedNow };
const ids = { create: () => '00000000-0000-4000-8000-000000000001' };
const makeService = (repository: WorkoutRepository) => new WorkoutService(repository, clock, ids);

async function createWorkoutWithCompletedSet(service: WorkoutService) {
  const workout = await service.start('胸部训练');
  await service.addExercises(workout.id, [barbellBench]);
  await service.completeSet(workout.id, exerciseId, { setIndex: 1, weightKg: 80, reps: 8 });
  return (await service.resume())!;
}
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- WorkoutService.test.ts activeWorkoutStore.test.ts --runInBand`

Expected: FAIL because the service and store do not exist.

- [ ] **Step 3: Implement the service and write-through store**

The store updates local input immediately, schedules a 300 ms repository flush, exposes `flushPending()`, and invokes it when the AppState leaves `active`. Completing a set cancels its pending timer and persists validated values immediately.

- [ ] **Step 4: Verify recovery, empty-workout, and transaction behavior**

Run: `npm test -- WorkoutService.test.ts activeWorkoutStore.test.ts --runInBand` and `npm test -- --runInBand`.

Expected: recovery matches the persisted values; an empty workout cannot finish; failed finish leaves status `in_progress`.

- [ ] **Step 5: Commit active workout logic**

```bash
git add src/features/workouts/application src/stores
git commit -m "feat: persist recoverable workout sessions"
```

### Task 6: Exercise library and custom exercise flow

**Files:**
- Create: `src/features/exercises/application/ExerciseService.ts`
- Create: `src/features/exercises/components/ExerciseListItem.tsx`
- Create: `src/features/exercises/components/MuscleFilter.tsx`
- Create: `src/features/exercises/screens/ExerciseLibraryScreen.tsx`
- Create: `src/features/exercises/screens/ExerciseFormScreen.tsx`
- Create: `app/exercises/index.tsx`
- Create: `app/exercises/create.tsx`
- Create: `app/exercises/[id].tsx`
- Test: `src/features/exercises/screens/__tests__/ExerciseLibraryScreen.test.tsx`
- Test: `src/features/exercises/screens/__tests__/ExerciseFormScreen.test.tsx`

**Interfaces:**
- Consumes: `ExerciseRepository`, shared theme controls, React Hook Form, and Zod.
- Produces: searchable/filterable exercise library and create/edit/archive custom exercise screens.

- [ ] **Step 1: Write failing library and form tests**

```tsx
it('filters exercises by search text and muscle group together', async () => {
  renderExerciseLibrary([barbellBench, dumbbellBench, barbellRow]);
  fireEvent.press(screen.getByText('胸'));
  fireEvent.changeText(screen.getByPlaceholderText('搜索动作、肌群或器械'), '杠铃');
  expect(screen.getByText('杠铃卧推')).toBeTruthy();
  expect(screen.queryByText('哑铃卧推')).toBeNull();
  expect(screen.queryByText('杠铃划船')).toBeNull();
});

it('rejects a whitespace-only custom exercise name', async () => {
  renderExerciseForm();
  fireEvent.changeText(screen.getByLabelText('动作名称'), '   ');
  fireEvent.press(screen.getByText('保存动作'));
  expect(await screen.findByText('请输入动作名称')).toBeTruthy();
});
```

`renderExerciseLibrary` renders `ExerciseLibraryScreen` with an `InMemoryExerciseRepository` populated from the provided fixtures; `renderExerciseForm` renders `ExerciseFormScreen` with the same repository and a no-op successful router.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- ExerciseLibraryScreen.test.tsx ExerciseFormScreen.test.tsx --runInBand`

Expected: FAIL because the screens do not exist.

- [ ] **Step 3: Implement the service and screens**

Use controlled search and muscle chips, render built-in/custom labels, submit normalized form values through `ExerciseService`, hide archive for built-in rows, and confirm before archiving custom rows.

- [ ] **Step 4: Verify GREEN, accessibility, and commit**

Run: `npm test -- --runInBand`, `npm run typecheck`, and `npm run lint`.

```bash
git add app/exercises src/features/exercises
git commit -m "feat: build exercise library"
```

### Task 7: Start and active workout screens

**Files:**
- Create: `src/features/workouts/components/ExerciseSetTable.tsx`
- Create: `src/features/workouts/components/WorkoutExerciseCard.tsx`
- Create: `src/features/workouts/screens/StartWorkoutScreen.tsx`
- Create: `src/features/workouts/screens/ActiveWorkoutScreen.tsx`
- Create: `src/features/workouts/screens/ResumeWorkoutSheet.tsx`
- Create: `app/workout/start.tsx`
- Create: `app/workout/active.tsx`
- Test: `src/features/workouts/screens/__tests__/ActiveWorkoutScreen.test.tsx`
- Test: `src/features/workouts/screens/__tests__/ResumeWorkoutSheet.test.tsx`

**Interfaces:**
- Consumes: `WorkoutService`, active workout store, exercise service, theme controls, and Expo Router.
- Produces: complete mobile recording flow and background flush wiring.

- [ ] **Step 1: Write failing fast-entry and recovery UI tests**

```tsx
it('copies weight, leaves reps blank, and focuses reps when adding a set', async () => {
  renderActiveWorkout(workoutWithSet({ weightKg: 80, reps: 8 }));
  fireEvent.press(screen.getByText('添加一组'));
  expect(screen.getAllByLabelText('重量')[1]).toHaveProp('value', '80');
  expect(screen.getAllByLabelText('次数')[1]).toHaveProp('value', '');
  expect(screen.getAllByLabelText('次数')[1]).toHaveProp('autoFocus', true);
});

it('offers resume and discard for a recovered workout', () => {
  render(<ResumeWorkoutSheet workout={activeWorkout} />);
  expect(screen.getByText('继续训练')).toBeTruthy();
  expect(screen.getByText('丢弃草稿')).toBeTruthy();
});
```

The test defines `activeWorkout` as an `in_progress` workout containing `barbellBench`, and `renderActiveWorkout` installs it into a fresh Zustand store before rendering the screen.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- ActiveWorkoutScreen.test.tsx ResumeWorkoutSheet.test.tsx --runInBand`

Expected: FAIL because the screens do not exist.

- [ ] **Step 3: Implement start selection and full-screen recording**

Implement multi-select exercise picking, explicit ordering controls, elapsed timer display, set table input, completion check, add/remove set, action notes, add exercise, finish confirmation, and a non-destructive back action. Wire AppState background events to `flushPending()`.

- [ ] **Step 4: Verify critical flows and commit**

Run: `npm test -- --runInBand`, `npm run typecheck`, and `npm run lint`.

```bash
git add app/workout src/features/workouts
git commit -m "feat: add fast workout recording"
```

### Task 8: Dashboard, history, app bootstrap, and release verification

**Files:**
- Create: `src/app/AppBootstrap.tsx`
- Create: `src/features/dashboard/screens/DashboardScreen.tsx`
- Create: `src/features/history/screens/WorkoutHistoryScreen.tsx`
- Create: `src/features/history/screens/WorkoutDetailScreen.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/training.tsx`
- Modify: `app/(tabs)/analysis.tsx`
- Modify: `app/(tabs)/profile.tsx`
- Modify: `app/workout/[id].tsx`
- Modify: `README.md`
- Test: `src/features/dashboard/screens/__tests__/DashboardScreen.test.tsx`
- Test: `src/features/history/screens/__tests__/WorkoutHistoryScreen.test.tsx`
- Test: `src/features/history/screens/__tests__/WorkoutDetailScreen.test.tsx`

**Interfaces:**
- Consumes: database bootstrap, exercise seed, repositories, workout service, and Router screens from prior tasks.
- Produces: user-visible app startup, recent workout dashboard, completed history list/detail, honest future-feature states, and repository documentation.

- [ ] **Step 1: Write failing dashboard and history tests**

```tsx
it('prioritizes continuing an active workout over starting a new one', async () => {
  renderDashboard({ activeWorkout, recentWorkout: null });
  expect(await screen.findByText('继续训练')).toBeTruthy();
  expect(screen.queryByText('开始训练')).toBeNull();
});

it('renders stored snapshots after the source exercise is renamed', async () => {
  renderWorkoutDetail(completedWorkoutWithSnapshot('杠铃卧推'));
  expect(await screen.findByText('杠铃卧推')).toBeTruthy();
  expect(screen.getByText('80 kg × 8')).toBeTruthy();
});
```

The history test helper builds a completed workout whose `exerciseNameSnapshot` is the supplied string, while the injected exercise repository contains the renamed source. The assertion therefore exercises the snapshot rather than repository display data.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- DashboardScreen.test.tsx WorkoutHistoryScreen.test.tsx WorkoutDetailScreen.test.tsx --runInBand`

Expected: FAIL because the dashboard/history screens do not exist.

- [ ] **Step 3: Implement bootstrap, dashboard, history, and honest placeholders**

Bootstrap opens SQLite, runs migration and seeding, shows a retryable error state on failure, and mounts repositories only after success. Dashboard shows active/recent training without fabricated metrics. History is sorted newest first. Analysis and plan surfaces state that these features arrive in later phases.

- [ ] **Step 4: Document setup and run the full automated gate**

README documents prerequisites, `npm install`, `npx expo start`, tests, architecture, and offline storage behavior.

Run: `npm test -- --runInBand`, `npm run typecheck`, and `npm run lint`.

Expected: zero failing tests, zero type errors, and zero lint errors.

- [ ] **Step 5: Run Expo export smoke verification**

Run: `npx expo export --platform android --output-dir dist/android-smoke` and `npx expo export --platform ios --output-dir dist/ios-smoke`.

Expected: both exports exit 0 without unresolved modules or route errors. Keep `dist/` ignored.

- [ ] **Step 6: Inspect final repository state and commit**

```bash
git status --short
git diff --check
git add app src README.md .gitignore package.json package-lock.json app.json tsconfig.json eslint.config.js jest.config.js jest.setup.ts
git commit -m "feat: deliver offline workout tracking MVP"
```

- [ ] **Step 7: Push the verified branch**

Run: `git push origin main` after confirming local `HEAD` contains every task commit and the worktree is clean.

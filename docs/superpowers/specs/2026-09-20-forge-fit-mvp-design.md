# Forge Fit 第一阶段 MVP 设计规格

日期：2026-09-20
状态：待用户书面审阅
仓库：`yiweilu333/codex-2`

## 1. 产品目标

Forge Fit 是一款面向个人长期使用的离线优先力量训练记录 App。第一阶段的目标不是覆盖所有健身分析功能，而是建立一个快速、可靠、可恢复的训练记录闭环：用户能够选择动作、录入每组重量和次数、完成训练，并准确查看历史记录。

产品最终方向是“Strong + Hevy + AI 私人训练助手”。第一阶段的架构必须允许后续增加训练容量、PR、渐进超负荷、身体数据、训练计划和 AI 分析，而不要求重写训练记录核心。

## 2. 用户与成功标准

目标用户是使用手机在健身房记录力量训练的单个用户。使用场景具有以下特点：

- 用户可能单手操作，训练组之间的操作时间短。
- 网络连接不可靠，核心功能必须完全离线运行。
- App 可能在训练中进入后台，甚至被系统终止。
- 历史数据具有长期价值，不能因动作重命名或版本升级而损坏。

第一阶段成功意味着用户可以在 iOS 和 Android 上通过 Expo 完成“开始训练 → 添加动作 → 逐组记录 → 完成训练 → 查看历史”的完整流程，并且意外退出后能够恢复训练草稿。

## 3. 第一阶段范围

### 3.1 包含

- React Native、Expo 和 TypeScript 项目基础架构。
- SQLite 初始化、版本迁移和内置动作种子。
- 16 个内置常见动作。
- 动作搜索、肌群筛选和动作详情。
- 创建、编辑和归档自定义动作。
- 开始、继续和丢弃训练。
- 添加、排序和删除训练动作。
- 添加、删除和完成训练组。
- 快速输入重量与次数。
- 训练备注和动作备注。
- 写穿式训练草稿、后台刷新和异常退出恢复。
- 完成训练和查看历史列表、历史详情。
- 基础首页：开始或继续训练、最近一次训练。
- 午夜黑与健康蓝视觉主题。
- 跟随系统的深色和浅色模式。

### 3.2 明确不包含

- 图表、周/月容量分析和肌群平衡分析。
- PR 自动识别和历史突破页面。
- 训练计划创建与编辑。
- 完整组间休息计时器。
- 渐进超负荷建议。
- 身体数据记录。
- AI 训练助手。
- 云同步、登录和多用户系统。

数据库会预留 RPE、休息时间和组评论字段，但第一阶段界面不提供完整的高级记录流程。

## 4. 技术方案

### 4.1 技术栈

- React Native + Expo。
- TypeScript 严格模式。
- Expo Router 负责文件路由与导航。
- `expo-sqlite` 负责设备本地持久化。
- Zustand 负责当前训练的响应式草稿镜像。
- React Hook Form 与 Zod 负责表单和输入校验。
- Jest、jest-expo 和 React Native Testing Library 负责自动化测试。
- ESLint 与 TypeScript 编译检查作为质量门禁。

### 4.2 目录结构

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    training.tsx
    analysis.tsx
    profile.tsx
  exercises/
    index.tsx
    create.tsx
    [id].tsx
  workout/
    start.tsx
    active.tsx
    [id].tsx

src/
  db/
    client.ts
    migrate.ts
    migrations/
    seed/
  features/
    dashboard/
    exercises/
    workouts/
    history/
  stores/
    activeWorkoutStore.ts
  shared/
    components/
    theme/
    utils/
    validation/
```

功能代码按业务能力组织。页面依赖应用用例；应用用例依赖 Repository 接口；SQLite 实现 Repository。领域逻辑不直接依赖 React Native 或 SQLite。

## 5. 页面与导航

### 5.1 主导航

底部导航包含四个稳定入口和一个居中的全局开始按钮：

1. 首页。
2. 训练。
3. 开始训练按钮。
4. 分析。
5. 我的。

第一阶段的分析页显示明确的后续功能说明，不伪造分析数据。训练页内部包含“历史、计划、动作库”三个分区；第一阶段启用历史和动作库，计划分区显示后续功能说明。

### 5.2 首页

首页显示：

- 当前未完成训练及“继续训练”入口。
- 没有草稿时显示主要“开始训练”按钮。
- 最近一次已完成训练的日期、名称、动作数和组数。
- 动作库快捷入口。

本阶段不显示伪造的周训练容量或 PR。

### 5.3 动作库

动作库提供：

- 按动作名称、肌群或器械搜索。
- 按胸、背、肩、腿、手臂筛选。
- 内置动作与自定义动作的视觉区分。
- 创建和编辑自定义动作。
- 归档自定义动作；内置动作不可删除。

### 5.4 开始训练

开始训练流程为：

1. 创建训练草稿并记录开始时间。
2. 从动作库选择一个或多个动作。
3. 调整动作顺序。
4. 进入全屏训练记录页。

### 5.5 全屏训练记录

训练页顶部固定显示训练名称、持续时间和“完成训练”。每个动作卡片显示上次训练摘要，并以表格形式显示组序、重量、次数和完成按钮。

交互规则：

- 数值输入使用数字键盘。
- 新增组默认复制上一组的重量，次数留空。
- 完成一组后焦点移动到下一组的次数输入。
- 删除动作或训练组需要明确确认。
- 完成训练前要求至少存在一个已完成训练组。
- 关闭页面不会丢弃训练，而是返回可恢复草稿。

### 5.6 历史记录

历史列表按训练开始时间倒序显示。每项显示训练名称、日期、时长、动作数量和已完成组数。详情页显示训练备注、动作顺序及每组重量和次数。

## 6. 视觉系统

选定方案为“午夜黑 + 健康蓝”。

- 深色背景：`#0D1117`。
- 深色卡片：`#171E27`。
- 主操作色：`#65AFFF`。
- 深色主文字：`#F6F8FA`。
- 深色次要文字：`#929EAD`。
- PR 语义色：金色。
- 危险操作：低饱和红色。
- 最小触控区域：48 × 48 dp。
- 主要圆角层级：12、16、24 dp。
- 重量、次数和计时数字启用等宽数字特性。

浅色模式使用相同语义令牌，而不是在组件中写死颜色。界面需满足可读性和足够的文字对比度。

## 7. 数据库设计

所有业务主键使用 UUID 字符串。日期以 ISO 8601 UTC 字符串保存，显示时转换为设备本地时区。重量统一以 kg 存储。

### 7.1 `app_meta`

| 字段 | 类型 | 约束 |
|---|---|---|
| `key` | TEXT | PRIMARY KEY |
| `value` | TEXT | NOT NULL |

用于记录数据库版本和少量应用级元数据。

### 7.2 `exercises`

| 字段 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `muscle_group` | TEXT | NOT NULL |
| `movement_type` | TEXT | NOT NULL |
| `equipment` | TEXT | NOT NULL |
| `default_rest_seconds` | INTEGER | NOT NULL, CHECK >= 0 |
| `notes` | TEXT | NULL |
| `is_custom` | INTEGER | NOT NULL, CHECK IN (0,1) |
| `created_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |
| `archived_at` | TEXT | NULL |

内置动作使用稳定的固定 UUID，确保种子操作可重复执行且不会生成重复数据。

### 7.3 `workouts`

| 字段 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `title` | TEXT | NOT NULL |
| `status` | TEXT | `draft`, `in_progress`, `completed`, `discarded` |
| `started_at` | TEXT | NOT NULL |
| `ended_at` | TEXT | NULL |
| `duration_seconds` | INTEGER | NULL, CHECK >= 0 |
| `notes` | TEXT | NULL |
| `created_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |

### 7.4 `workout_exercises`

| 字段 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `workout_id` | TEXT | NOT NULL, FK → workouts |
| `exercise_id` | TEXT | NOT NULL, FK → exercises |
| `exercise_name_snapshot` | TEXT | NOT NULL |
| `muscle_group_snapshot` | TEXT | NOT NULL |
| `sort_order` | INTEGER | NOT NULL, CHECK >= 0 |
| `notes` | TEXT | NULL |

名称和肌群快照保证动作后续重命名或归档时不会改变历史展示。

### 7.5 `workout_sets`

一条记录表示一个训练组，不保存冗余的“组数”字段。

| 字段 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `workout_exercise_id` | TEXT | NOT NULL, FK → workout_exercises |
| `set_index` | INTEGER | NOT NULL, CHECK >= 1 |
| `set_type` | TEXT | `warmup`, `working`, `drop`, `failure` |
| `weight_kg` | REAL | NULL, CHECK >= 0 |
| `reps` | INTEGER | NULL, CHECK >= 0 |
| `rest_seconds` | INTEGER | NULL, CHECK >= 0 |
| `rpe` | REAL | NULL, CHECK 1–10 |
| `comment` | TEXT | NULL |
| `is_completed` | INTEGER | NOT NULL, CHECK IN (0,1) |
| `completed_at` | TEXT | NULL |

### 7.6 索引与删除行为

```sql
CREATE INDEX idx_workouts_started_at
  ON workouts(started_at DESC);

CREATE INDEX idx_workout_exercises_workout
  ON workout_exercises(workout_id, sort_order);

CREATE UNIQUE INDEX idx_workout_sets_order
  ON workout_sets(workout_exercise_id, set_index);

CREATE INDEX idx_workout_sets_completed
  ON workout_sets(completed_at);
```

删除训练时，在事务中级联删除训练动作和训练组。动作使用软删除，不能因归档动作而删除历史训练。

## 8. 内置动作

第一阶段种子包含以下 16 个动作：

- 胸：杠铃卧推、哑铃卧推、上斜卧推、飞鸟。
- 背：引体向上、高位下拉、杠铃划船、坐姿划船。
- 肩：肩推、侧平举、后束飞鸟。
- 腿：深蹲、硬拉、腿举、腿弯举。
- 手臂：二头弯举、三头下压。

注：上述清单实际包含 17 个动作。实现以完整清单为准，验收标准相应要求 17 个内置动作，避免为了满足早期数量描述而删除用户明确列出的动作。

## 9. 数据流与状态

### 9.1 依赖方向

```text
Screens / Components
        ↓
Application Use Cases
        ↓
Repository Interfaces
        ↓
SQLite Repository Implementations
```

页面不能直接拼接或执行 SQL。Repository 返回统一领域模型，未来的 AI 分析和云同步通过新的应用用例读取相同 Repository 接口。

### 9.2 草稿写入

1. 开始训练时立即创建 `in_progress` 记录。
2. Zustand 保存当前页面的响应式镜像。
3. 用户停止输入 300 ms 后将未完成字段写入 SQLite 草稿。
4. 完成一组时，在单次事务中立即写入重量、次数和完成状态。
5. App 进入后台时强制刷新所有尚未写入的字段。
6. 完成训练时原子更新结束时间、时长和状态。

### 9.3 恢复与错误处理

- 启动时检测 `in_progress` 训练，并提供继续或丢弃操作。
- 数据库写入失败时保留内存草稿，显示非阻塞错误和重试操作。
- 在数据库确认成功前，界面不能显示“已保存”。
- 数据库迁移在事务中执行；失败时回滚并显示可恢复错误页。
- 完成空训练时保留当前页面，并要求继续编辑或明确丢弃。
- 页面级错误由错误边界捕获，数据库错误保留可诊断日志，但日志不得包含用户训练备注全文。

## 10. 输入规则

- 重量允许 `0`，用于自重或只记录次数的动作；不允许负数。
- 重量最多保留两位小数。
- 次数必须是 0 或正整数。
- 未完成训练组可以保留空重量或空次数。
- 标记完成时，重量和次数均必须存在。
- 训练名称去除首尾空白后不能为空。
- 自定义动作名称去除首尾空白后不能为空。
- RPE、休息时间和评论字段第一阶段可由数据库读取和写入，但不作为主要 UI 流程。

## 11. 测试策略

开发采用测试驱动流程：先写会因缺失行为而失败的测试，再写最小实现并运行完整测试套件。

### 11.1 领域单元测试

- 数字输入与训练完成校验。
- 训练状态转换。
- 动作和训练组排序。
- 草稿恢复选择。
- 历史快照保持不变。

### 11.2 Repository 集成测试

- 迁移可重复运行。
- 种子操作不生成重复动作。
- 完成训练在单个事务中保存。
- 删除训练会级联删除训练动作和训练组。
- 归档动作不会删除或改变历史快照。
- App 重启后可以读取未完成训练。

### 11.3 组件测试

- 动作搜索与肌群筛选。
- 重量、次数的数字输入。
- 完成一组与新增一组。
- 结束训练确认。
- 草稿恢复提示。
- 深浅色主题令牌应用。

### 11.4 质量门禁

每个实现批次必须通过：

- 完整 Jest 测试套件。
- TypeScript 严格类型检查。
- ESLint。
- Android 或 iOS 至少一个 Expo 启动烟雾测试。

最终 MVP 在 Android 和 iOS 上分别完成一次手动验收，覆盖数字键盘、滚动、后台恢复和系统主题切换。

## 12. 验收标准

1. 首次启动自动建立数据库并生成 17 个内置动作。
2. 多次启动不会重复生成动作。
3. 自定义动作重启 App 后仍然存在。
4. 用户能从首页开始训练，选择多个动作并调整顺序。
5. 每组可以快速录入 `80 kg × 10` 并点击完成。
6. App 进入后台或被关闭后，可以恢复未完成训练。
7. 完成训练后，历史列表立即出现该训练。
8. 历史详情准确显示动作、组序、重量、次数和备注。
9. 空训练、负数和非法次数不能被错误保存。
10. 删除或重命名动作不会破坏既有训练历史。
11. 无网络环境下所有 MVP 功能正常使用。
12. Android 与 iOS 均可通过 Expo 启动。
13. 自动化测试、TypeScript 和 ESLint 检查全部通过。

## 13. 后续扩展

第二阶段增加图表、PR 和训练容量统计。第三阶段增加渐进超负荷、身体变化和 AI 建议。PR、训练容量和力量趋势最初根据 `workout_sets` 计算，不建立不可重建的重复事实表。

训练计划将使用 `training_plans`、`plan_days` 和 `plan_exercises`。渐进规则使用 `progression_rules`。AI 分析读取聚合后的结构化训练摘要，并将运行记录保存在 `ai_analysis_runs`；训练 UI 不直接依赖具体 AI 服务。

# Forge Fit

Forge Fit 是一款本地优先的力量训练记录 App。第一阶段 MVP 已支持内置与自定义动作、快速记录重量和次数、训练草稿恢复，以及历史训练查看。

## 技术栈

- React Native + Expo Router + TypeScript
- SQLite 本地持久化（`expo-sqlite`）
- Zustand 训练草稿状态
- Zod 数据校验
- Jest + React Native Testing Library

## 本地运行

需要 Node.js 20+、npm，以及安装了 Expo Go 的手机或 Android/iOS 模拟器。

```bash
npm install
npx expo start
```

终端显示二维码后，可使用 Expo Go 扫码运行。也可按 `a` 打开 Android，或按 `i` 打开 iOS（需要 macOS）。

## 质量检查

```bash
npm test -- --runInBand
npm run typecheck
npm run lint
```

## 架构

代码按功能域组织：`src/features` 包含动作、训练、首页与历史模块；`src/db` 负责 SQLite 迁移和种子数据；`src/shared` 提供主题和通用组件；`src/stores` 管理可恢复的训练草稿。路由位于 `app`。

所有训练数据默认只保存在当前设备的 `forge-fit.db` 中，不上传服务器。数据库启动失败时会显示可重试状态。第二阶段将增加容量、PR 与趋势分析，第三阶段再加入渐进超负荷、身体数据和 AI 建议。

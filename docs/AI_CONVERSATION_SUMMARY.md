# AI 对话历史整理

> 本文件记录 2048 AI 项目在本次会话中的开发、调试与交付过程，作为 Bindo Labs 面试交付物之一。

## 项目背景

- **项目位置**：`D:\projectwork\2048-ai`
- **技术栈**：React 19 + TypeScript + Vite + Tailwind CSS v3
- **会话开始时状态**：核心游戏逻辑、AI 引擎、响应式 UI 已完成，`npm run build` 通过，Git 仓库已初始化但尚未推送到 GitHub。
- **目标**：完成项目收尾、GitHub Pages 部署，以及 UI/UX 最终打磨。

## 会话目标

1. 创建 GitHub 仓库并推送代码。
2. 开启 GitHub Pages 自动部署。
3. 修复数字方块与背景格子对不齐的问题。
4. 增强数字融合时的动态特效。
5. 整理 AI 对话历史作为交付物。

## 已完成工作

### 1. GitHub 仓库与 Pages 部署

- 添加 remote：`https://github.com/fionetu/2048-ai.git`
- 推送 `main` 分支到 GitHub。
- 配置 `.github/workflows/deploy.yml` 使用 GitHub Actions 自动部署到 Pages：
  - 升级 Node 版本到 22。
  - 升级 `actions/configure-pages` 到 v5。
  - 开启并发控制 `cancel-in-progress: true`，避免多个 workflow 同时运行导致 artifact 冲突。
- **最终状态**：代码已推送到 GitHub，Actions workflow 配置完成，待用户在仓库 Settings → Pages 中手动选择 **GitHub Actions** 作为 Source 后即可部署。

### 2. 方块对齐修复

**问题描述**：数字方块与背景格子位置不匹配，视觉上整体偏右下，显得不美观。

**关键文件**：
- `src/components/Board.tsx`：计算棋盘大小、gap、tileSize，渲染背景格子层。
- `src/components/Tile.tsx`：根据 `tileSize` 和 `gap` 计算每个数字方块的绝对定位位置。

**调试过程**：
1. 统一背景格子层与方块层的 padding 计算，移除硬编码的 `p-2`。
2. 调整 gap 比例、board 尺寸、圆角大小。
3. 移除右下方向阴影，避免视觉偏移。
4. 切换为 Classic 2048 风格，增大棋盘、使用不透明格子背景。
5. 最终发现用户本地环境存在约 15px 的渲染偏移，经用户确认后采用固定补偿值。

**最终方案**（`src/components/Tile.tsx`）：

```tsx
const left = gap + col * (tileSize + gap) - 15;
const top = gap + row * (tileSize + gap) - 15;
```

### 3. 滑动合并动画

**问题描述**：融合时源数字直接消失，新数字突然出现，缺乏“滑动碰撞”的动态效果。

**实现方案**：
- 扩展 `TileData` 类型，新增 `isMerging` 标记。
- 扩展 `moveBoard()` 返回 `MergeEvent`，记录每次合并的源方块 id 和目标位置。
- 在 `useGameLogic.ts` 中引入动画阶段：
  - 移动发生时先渲染源方块滑入目标格子的“ghost”状态。
  - 150ms 后再提交真实状态，显示合并后的新方块。
- 新增 `isAnimating` 状态，动画期间阻塞键盘、触屏和 AI 输入。
- 在 `index.css` 中增强合并特效：放大 + 亮度闪光。

**关键文件**：
- `src/types/index.ts`
- `src/utils/board.ts`
- `src/hooks/useGameLogic.ts`
- `src/hooks/useAI.ts`
- `src/components/Tile.tsx`
- `src/index.css`

### 4. UI 风格切换

- 将棋盘最大宽度从 400px 增加到 500px。
- 格子背景从半透明改为 Classic 2048 的不透明 `#cdc1b4`。
- 调整圆角为更锐利的 `rounded-md` / `rounded-sm`。

## 关键决策

| 决策 | 原因 | 结果 |
|------|------|------|
| 使用 GitHub Actions 部署 Pages | 项目为纯前端静态站点，官方 CI/CD 最稳定 | `.github/workflows/deploy.yml` |
| 手动开启 Pages 而非自动 enablement | `configure-pages` 的自动 enablement 权限不稳定，多次部署失败 | 用户需在 Settings → Pages 中手动选择 GitHub Actions |
| 合并动画采用“ghost 源方块滑入”方案 | 用户选择完整动画，效果最好 | 源方块可见滑动，合并后弹出 |
| 动画期间阻塞输入 | 避免快速操作导致状态错乱 | `isAnimating` 控制 |
| 固定 15px 对齐补偿 | 用户本地验证通过，比例补偿效果不如固定值稳定 | `Tile.tsx` 中 `-15px` |

## 遇到的问题与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `git push` 报 repository not found | GitHub 仓库尚未创建 | 用户手动在 GitHub 创建空仓库后再 push |
| Actions 报 `Get Pages site failed` / `Not Found` | Pages 站点未启用 | 升级 `configure-pages` 到 v5，并提醒用户手动开启 Pages |
| `Multiple artifacts named "github-pages"` | 连续 push 导致多个 workflow 并发上传同名 artifact | `cancel-in-progress: true` |
| 数字方块偏右下 | 用户本地浏览器/环境存在渲染偏移 | `Tile.tsx` 中固定 `-15px` 补偿 |
| 合并动画弱 | 合并后创建新 tile，源 tile 立即卸载 | 引入动画阶段和 ghost tile |

## 最终代码状态

- **分支**：`main`
- **最新 commit**：`f25b9f4 Apply fixed 15px up-left offset for tile alignment`
- **构建状态**：`npm run build` ✅
- **GitHub 仓库**：`https://github.com/fionetu/2048-ai`
- **GitHub Pages**：待用户在 Settings → Pages 中开启 GitHub Actions 源后生效，预期地址 `https://fionetu.github.io/2048-ai/`

## 关键文件清单

- `src/components/Board.tsx`：棋盘与背景格子布局。
- `src/components/Tile.tsx`：数字方块渲染与定位（含最终 -15px 补偿）。
- `src/utils/board.ts`：游戏移动、合并逻辑与合并事件记录。
- `src/hooks/useGameLogic.ts`：游戏状态管理与动画阶段。
- `src/hooks/useAI.ts`：AI 自动运行，动画期间跳过移动。
- `src/App.tsx`：键盘/触屏输入与 AI 集成。
- `src/index.css`：动画（appear / pop / flash）。
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署。

## 待办事项（剩余）

1. 在 GitHub 仓库 Settings → Pages 中开启 **GitHub Actions** 源。
2. 等待 Actions 部署完成，验证线上效果。
3. 录制项目演示视频。
4. （可选）进一步优化 UI，例如按钮/标题也改为更统一的 Classic 2048 风格。

## 备注

- 本地 `npm run dev` 可正常预览所有改动。
- 已把截图文件加入 `.gitignore`，避免误提交。
- 合并动画时长 150ms，AI 快速模式下会自动等待动画完成后再执行下一步。

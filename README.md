# 2048 AI Solver

一个支持 AI 自动求解的 2048 网页游戏，使用 React + TypeScript + Vite + Tailwind CSS 构建。

## 功能

- 经典 2048 游戏规则：滑动合并方块，达成 2048 即获胜
- 桌面端键盘控制（方向键 / WASD）
- 移动端触屏滑动控制
- AI 自动运行模式（基于 Expectimax + 启发式评估）
- AI 提示箭头，告诉你下一步最优方向
- 最高分本地持久化
- 响应式 UI + 方块移动/合并动画

## AI 算法

- **搜索算法**：Expectimax，处理 2048 中随机生成新方块的 chance node
- **评估函数**：综合空格数量、蛇形权重、单调性、平滑度和最大块角落奖励
- **搜索深度**：默认 3 层，可在 AI 提示时使用 2 层保证即时响应
- **表现**：通常能在几百步内合成 2048

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库 `2048-ai`
2. 推送代码到 `main` 分支
3. 进入仓库 Settings → Pages → Source，选择 "GitHub Actions"
4. 推送触发 `.github/workflows/deploy.yml` 自动部署
5. 访问 `https://你的用户名.github.io/2048-ai/`

## 交付物

- 完整项目源码（本仓库）
- AI 编程对话历史
- 项目录屏（建议演示手动游玩 + AI 自动求解过程）
- 线上访问地址（通过 GitHub Pages）

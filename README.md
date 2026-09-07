# new-miskir-project-main

智慧农业平台前端代码仓库（主应用 + 六模块：farmland / production / harvest / logistics / processing / sustainability）。

## 目录结构
- `frontend/` —— 前端源码（所有页面修改都在 `frontend/src` 下）

## 本地开发
```bash
cd frontend
npm install
npm run dev
```

## 环境文件说明
- 已提交：`.env.example`、`.env.development`（本地开发默认值，clientId 为开发占位 `tenant-client`）
- 未提交：`.env.production`、`.env.logistics`（含生产 clientId，部署时由项目 owner 在本地补齐，模板见 `.env.example`）

## 提交规范
- 不要提交：`node_modules`、`dist`、`dist-*`、`modules-pkg`、`_pkg`、`.env.production`（已写入 `.gitignore`）
- 修改完请推送到本仓库，由项目 owner 拉回本地进行打包部署

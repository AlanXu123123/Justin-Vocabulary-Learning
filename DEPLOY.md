# 部署说明

## 推送到 GitHub 后自动部署 Firebase

1. 在本机安装 [Firebase CLI](https://firebase.google.com/docs/cli) 并已登录：`npx firebase login`
2. 生成长效令牌（仅显示一次，请保密）：
   ```bash
   npx firebase login:ci
   ```
3. 打开 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `FIREBASE_TOKEN`
   - Value: 粘贴上一步生成的令牌
4. 之后每次把代码 **push 到 `main` 分支**，且改动了 `school-courses-review/`、`firebase.json` 等相关文件时，GitHub Actions 会自动执行 `firebase deploy --only hosting`。

未配置 `FIREBASE_TOKEN` 时，工作流会失败；你仍可在本机执行 `npm.cmd run deploy:hosting` 手动部署。

## 手动部署（本机）

```powershell
Set-Location "d:\Cursor_Projects\Justin_School_Course"
npm.cmd run deploy:hosting
```

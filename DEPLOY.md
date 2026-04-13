# 部署说明

## Cloud Functions（AI 批改，Gemini 密钥在服务端）

AI 批改由 **`ss10GradeAnswer`**（Callable，区域 **`us-central1`**）调用 Gemini，密钥存放在 **Secret Manager**，**不要**写进 Git 或网页。

### 前提

- Firebase 项目需 **Blaze（按量计费）** 计划才能部署 Cloud Functions。
- 本机已安装 Node 20+、已 `firebase login`。

### 首次配置 Secret（只需一次）

在项目根目录执行：

```powershell
firebase functions:secrets:set GEMINI_API_KEY
```

按提示粘贴 [Google AI Studio](https://aistudio.google.com/apikey) 创建的密钥（勿提交到仓库）。

### 部署

```powershell
Set-Location "d:\Cursor_Projects\Justin_School_Course"
cd functions
npm install
cd ..
npm.cmd run deploy:all
```

或只部署函数 / 只部署 Hosting：

```powershell
npm.cmd run deploy:functions
npm.cmd run deploy:hosting
```

---

## 推送到 GitHub 后自动部署

1. 生成长效令牌：`npx firebase login:ci`
2. GitHub 仓库 → **Settings** → **Secrets** → **Actions** → 添加 **`FIREBASE_TOKEN`**

工作流会部署 **Hosting + Functions**（需先在 Firebase 项目里配置好 **`GEMINI_API_KEY`** Secret，否则函数会报错）。

未配置 `FIREBASE_TOKEN` 时，可在本机执行 `npm.cmd run deploy:all`。

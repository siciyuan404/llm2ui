# GitHub Actions 工作流

## deploy.yml - GitHub Pages 自动部署

这个工作流会自动将项目构建并部署到 GitHub Pages。

### 触发条件
- 推送到 `main` 分支时自动触发
- 可以在 GitHub Actions 页面手动触发

### 工作流程
1. **构建 (build)**
   - 检出代码
   - 设置 Node.js 20 环境
   - 安装依赖 (`npm ci`)
   - 构建项目 (`npm run build`)
   - 上传构建产物到 GitHub Pages

2. **部署 (deploy)**
   - 将构建产物部署到 GitHub Pages
   - 生成访问 URL

### 配置要求

在 GitHub 仓库中需要进行以下设置：

1. 进入仓库的 **Settings** > **Pages**
2. 在 **Source** 下选择 **GitHub Actions**
3. 保存设置

### 环境变量

- `GITHUB_PAGES=true`: 构建时设置，用于配置正确的 base URL

### 访问地址

部署成功后，可以通过以下地址访问：
```
https://<your-username>.github.io/llm2ui/
```

### 注意事项

- 确保 `vite.config.ts` 中的 `base` 配置正确
- 如果仓库名不是 `llm2ui`，需要修改 `vite.config.ts` 中的 base 路径
- 首次部署可能需要几分钟才能生效

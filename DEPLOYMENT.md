# GitHub Pages 部署指南

本项目已配置自动部署到 GitHub Pages。

## 快速开始

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** (设置)
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** (来源) 下拉菜单中选择 **GitHub Actions**
5. 保存设置

### 2. 触发部署

部署会在以下情况自动触发：

- **自动触发**: 每次推送代码到 `main` 分支时
- **手动触发**: 在 GitHub 仓库的 **Actions** 标签页，选择 "Deploy to GitHub Pages" 工作流，点击 "Run workflow"

### 3. 访问网站

部署成功后，你的网站将在以下地址可用：

```
https://<your-username>.github.io/llm2ui/
```

例如，如果你的 GitHub 用户名是 `siciyuan404`，访问地址就是：
```
https://siciyuan404.github.io/llm2ui/
```

## 配置说明

### Base URL 配置

项目已配置为使用环境变量来设置 base URL：

```typescript
// vite.config.ts
base: process.env.GITHUB_PAGES === 'true' ? '/llm2ui/' : '/'
```

- 本地开发时使用 `/` 作为根路径
- GitHub Pages 部署时使用 `/llm2ui/` 作为根路径

### 修改仓库名

如果你的仓库名不是 `llm2ui`，需要修改 `vite.config.ts` 中的 base 配置：

```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/你的仓库名/' : '/'
```

## 工作流程

GitHub Actions 工作流包含两个主要步骤：

### 1. 构建 (Build)
- 检出代码
- 安装 Node.js 20
- 安装依赖
- 构建项目（设置 `GITHUB_PAGES=true`）
- 上传构建产物

### 2. 部署 (Deploy)
- 将构建产物部署到 GitHub Pages
- 生成访问 URL

## 本地测试

在推送到 GitHub 之前，你可以本地测试构建：

```bash
# 模拟 GitHub Pages 环境构建
GITHUB_PAGES=true npm run build

# 预览构建结果
npm run preview
```

## 故障排查

### 部署失败

1. 检查 **Actions** 标签页中的工作流日志
2. 确保 GitHub Pages 设置正确（Source 选择 GitHub Actions）
3. 确保仓库有足够的权限（Settings > Actions > General > Workflow permissions）

### 页面显示 404

1. 确认 `vite.config.ts` 中的 `base` 路径与仓库名匹配
2. 等待几分钟，GitHub Pages 部署可能需要一些时间
3. 清除浏览器缓存后重试

### 资源加载失败

1. 检查浏览器控制台的错误信息
2. 确认所有资源路径都是相对路径或使用了正确的 base URL
3. 检查 `public` 目录下的静态资源是否正确

## 自定义域名（可选）

如果你想使用自定义域名：

1. 在仓库的 `public` 目录下创建 `CNAME` 文件
2. 在文件中写入你的域名（例如：`llm2ui.example.com`）
3. 在你的域名提供商处配置 DNS 记录
4. 更新 `vite.config.ts` 中的 `base` 为 `/`

## 相关文件

- `.github/workflows/deploy.yml` - GitHub Actions 工作流配置
- `vite.config.ts` - Vite 构建配置
- `public/.nojekyll` - 告诉 GitHub Pages 不使用 Jekyll 处理

## 更多信息

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

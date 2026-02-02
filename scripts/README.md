# 脚本说明

## deploy-test.js

本地测试 GitHub Pages 部署的脚本。

### 使用方法

```bash
node scripts/deploy-test.js
```

或者添加到 package.json 的 scripts 中：

```json
{
  "scripts": {
    "deploy:test": "node scripts/deploy-test.js"
  }
}
```

然后运行：

```bash
npm run deploy:test
```

### 功能

1. 使用 `GITHUB_PAGES=true` 环境变量构建项目
2. 自动启动预览服务器
3. 模拟 GitHub Pages 的部署环境

### 注意事项

- 确保在项目根目录运行
- 需要先安装项目依赖 (`npm install`)
- 预览服务器默认运行在 http://localhost:4173

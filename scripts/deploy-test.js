#!/usr/bin/env node

/**
 * 本地测试 GitHub Pages 部署
 * 
 * 这个脚本模拟 GitHub Pages 的构建环境，
 * 帮助你在推送到 GitHub 之前测试部署配置。
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 开始本地部署测试...\n');

// 构建项目
console.log('📦 构建项目（GitHub Pages 模式）...');
const build = spawn('npm', ['run', 'build'], {
  cwd: rootDir,
  env: { ...process.env, GITHUB_PAGES: 'true' },
  stdio: 'inherit',
  shell: true
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ 构建失败');
    process.exit(code);
  }
  
  console.log('\n✅ 构建成功！');
  console.log('\n📂 构建产物位于: dist/');
  console.log('\n🔍 启动预览服务器...\n');
  
  // 启动预览服务器
  const preview = spawn('npm', ['run', 'preview'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  preview.on('close', (code) => {
    process.exit(code);
  });
});

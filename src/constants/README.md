# constants

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

常量定义目录，集中管理应用中使用的各类常量值。
包括 localStorage 存储键、默认配置值、平台类型等常量。

## 设计原则

1. **集中管理**: 所有常量集中在此目录，避免硬编码字符串散落在代码中
2. **类型安全**: 使用 `as const` 确保常量值的类型安全
3. **易于维护**: 修改常量值只需在一处修改
4. **命名规范**: 使用大写蛇形命名法 (UPPER_SNAKE_CASE)

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 常量导出入口，统一导出所有常量定义 |
| storage-keys.ts | localStorage 存储键常量，定义所有持久化存储使用的键名 |
| defaults.ts | 默认配置值常量，包括 LLM 配置、编辑器配置、面板配置等默认值 |
| platforms.ts | 平台类型常量，定义支持的平台类型、屏幕尺寸和断点配置 |

## 使用示例

```typescript
import { STORAGE_KEYS, DEFAULT_LLM_CONFIG, PLATFORMS } from '@/constants';

// 使用存储键
localStorage.setItem(STORAGE_KEYS.LLM_CONFIG, JSON.stringify(config));

// 使用默认配置
const config = {
  temperature: DEFAULT_LLM_CONFIG.temperature,
  maxTokens: DEFAULT_LLM_CONFIG.maxTokens,
};

// 使用平台类型
if (platform === PLATFORMS.MOBILE_WEB) {
  // 移动端逻辑
}
```

## 常量分类

### 存储键 (storage-keys.ts)
- `STORAGE_KEYS.LLM_CONFIG` - LLM 当前配置
- `STORAGE_KEYS.LLM_CONFIGS_LIST` - LLM 配置列表
- `STORAGE_KEYS.CUSTOM_EXAMPLES` - 自定义案例
- `STORAGE_KEYS.CUSTOM_MODELS` - 自定义模型
- `STORAGE_KEYS.APP_STATE` - 应用状态
- `STORAGE_KEYS.LAYOUT_STATE` - 布局状态

### 默认配置 (defaults.ts)
- `DEFAULT_LLM_CONFIG` - LLM 默认配置
- `DEFAULT_PROVIDER_CONFIGS` - 各提供商默认配置
- `DEFAULT_EDITOR_SPLIT_PERCENT` - 编辑器分割比例
- `DEFAULT_PANEL_WIDTHS` - 面板宽度配置

### 平台类型 (platforms.ts)
- `PLATFORMS` - 支持的平台类型
- `SCREEN_SIZES` - 屏幕尺寸类型
- `DEFAULT_BREAKPOINTS` - 默认断点配置

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。

# Validation 模块

UI Schema 验证模块，提供流式验证、多语言错误消息和自动修复功能。

## 目录结构

```
validation/
├── index.ts              # 模块导出入口
├── README.md             # 本文档
├── streaming/            # 流式验证
│   ├── types.ts          # 类型定义
│   ├── incremental-parser.ts    # 增量 JSON 解析器
│   ├── streaming-validator.ts   # 流式验证器
│   └── index.ts          # 子模块导出
├── i18n/                 # 多语言支持
│   ├── en.json           # 英文消息
│   ├── zh.json           # 中文消息
│   ├── error-formatter.ts # 错误格式化器
│   └── index.ts          # 子模块导出
└── auto-fix/             # 自动修复
    ├── types.ts          # 类型定义
    ├── icon-fixer.ts     # Emoji → Icon 修复器
    ├── schema-fixer.ts   # Schema 自动修复器
    └── index.ts          # 子模块导出
```

## 功能模块

### 1. 流式验证 (Streaming Validation)

在 LLM 生成过程中实时验证 JSON 片段。

```typescript
import { StreamingValidator, createStreamingValidator } from '@/lib/validation';

const validator = createStreamingValidator({
  onError: (error) => console.error('Error:', error),
  onWarning: (warning) => console.warn('Warning:', warning),
  onComponent: (component) => console.log('Found component:', component),
});

// 处理 JSON 片段
validator.feed('{"version": "1.0", "root": {');
validator.feed('"type": "Container"');
validator.feed('}}');

// 完成验证
const result = validator.finalize();
console.log('Valid:', result.valid);
```

### 2. 增量 JSON 解析器 (Incremental Parser)

解析不完整的 JSON 字符串。

```typescript
import { IncrementalParser, parseIncremental } from '@/lib/validation';

// 一次性解析
const result = parseIncremental('{"name": "test"');
console.log('Partial:', result.partial);
console.log('Value:', result.value);

// 增量解析
const parser = new IncrementalParser();
parser.parse('{"items": [');
parser.resume('1, 2, 3');
const final = parser.resume(']}');
console.log('Complete:', !final.partial);
```

### 3. 多语言错误消息 (i18n)

支持中英文错误提示。

```typescript
import { ErrorFormatter, formatError } from '@/lib/validation';

const formatter = new ErrorFormatter({ language: 'zh' });

const error = {
  code: 'UNKNOWN_COMPONENT',
  message: 'Unknown component type "Buton"',
  path: 'root.children[0]',
  severity: 'error' as const,
};

const formatted = formatter.format(error);
console.log(formatted.message); // 中文消息
console.log(formatted.suggestion); // 修复建议
```

### 4. Icon 修复器 (Icon Fixer)

自动将 emoji 转换为 Icon 组件。

```typescript
import { IconFixer, fixIcons, needsIconFix } from '@/lib/validation';

const schema = {
  version: '1.0',
  root: {
    type: 'Container',
    id: 'root',
    props: {},
    children: ['🔍 Search'],
  },
};

if (needsIconFix(schema)) {
  const result = fixIcons(schema);
  console.log('Fixed schema:', result.fixed);
  console.log('Changes:', result.changes);
}
```

### 5. Schema 修复器 (Schema Fixer)

自动修复常见的 Schema 错误。

```typescript
import { SchemaFixer, fixSchema, needsSchemaFix } from '@/lib/validation';

const schema = {
  root: {
    type: 'Containr', // 拼写错误
    props: {},
  },
};

const result = fixSchema(schema);
console.log('Fixed:', result.fixed);
console.log('Changes:', result.changes);
console.log('Unfixable:', result.unfixable);
```

## 类型定义

### ValidationError

```typescript
interface ValidationError {
  code: string;
  message: string;
  path: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
  suggestion?: string;
}
```

### IconFixResult

```typescript
interface IconFixResult {
  fixed: UISchema;
  changes: IconFixChange[];
  hasUnmapped: boolean;
  unmappedEmojis: string[];
}
```

### SchemaFixResult

```typescript
interface SchemaFixResult {
  fixed: UISchema;
  changes: SchemaFixChange[];
  unfixable: SchemaError[];
}
```

## 使用建议

1. **流式验证**: 在 LLM 生成过程中使用，可以提前发现错误
2. **自动修复**: 在验证失败后尝试自动修复，提高成功率
3. **多语言**: 根据用户偏好设置错误消息语言

# dev-mode

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

开发者模式组件目录，提供组件调试功能，包括组件轮廓显示和 Alt+点击复制组件信息。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| `index.ts` | 模块统一导出 |
| `DevModeProvider.tsx` | 开发者模式 Provider，为子组件提供轮廓显示和 Alt+点击功能 |
| `DevModeToggle.tsx` | 开发者模式开关组件 |

## 使用方式

### 1. 在应用根组件中包裹 DevModeProvider

```tsx
import { DevModeProvider } from '@/components/dev-mode';

function App() {
  return (
    <DevModeProvider>
      {/* 应用内容 */}
    </DevModeProvider>
  );
}
```

### 2. 添加开关组件

```tsx
import { DevModeToggle } from '@/components/dev-mode';

function Navbar() {
  return (
    <nav>
      <DevModeToggle showLabel={true} />
    </nav>
  );
}
```

### 3. 为组件添加调试属性

```tsx
function MyComponent() {
  return (
    <div
      data-dev-component="MyComponent"
      data-dev-file="src/components/MyComponent.tsx"
      data-dev-line="10"
    >
      组件内容
    </div>
  );
}
```

### 4. 代码中控制开发者模式

```typescript
import { useAppStore } from '@/stores';

// 设置开发者模式
const setDevMode = useAppStore((state) => state.setDevMode);
setDevMode('on');  // 开启
setDevMode('off'); // 关闭
```

## 功能说明

- **组件轮廓**: 开启开发者模式后，所有带 `data-dev-component` 属性的元素会显示蓝色虚线轮廓
- **Alt+点击复制**: 按住 Alt 键点击组件，会复制组件名和代码位置到剪贴板
- **视觉反馈**: 复制成功后组件会短暂显示绿色轮廓

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。

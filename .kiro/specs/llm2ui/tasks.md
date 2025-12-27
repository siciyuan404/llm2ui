# Implementation Plan: llm2ui

## Overview

基于 TypeScript + React 实现 llm2ui 系统。使用 Vite 作为构建工具，shadcn-ui 作为组件库，fast-check 进行属性测试。

## Tasks

- [x] 1. 项目初始化与基础架构
  - [x] 1.1 创建 Vite + React + TypeScript 项目
    - 初始化项目结构
    - 配置 TypeScript、ESLint、Prettier
    - 安装 shadcn-ui 及其依赖（Tailwind CSS、Radix UI）
    - _Requirements: 4.2_

  - [x] 1.2 设置测试框架
    - 配置 Vitest 作为测试运行器
    - 安装 fast-check 用于属性测试
    - 配置测试覆盖率报告
    - _Requirements: Testing Strategy_

- [x] 2. 核心数据模型实现
  - [x] 2.1 实现 UI Schema 类型定义
    - 创建 UISchema、UIComponent、EventBinding、StyleProps 接口
    - 实现 DataContext 类型
    - _Requirements: 5.1, 5.2_

  - [x] 2.2 实现 UI Schema 序列化/反序列化
    - 实现 serialize() 函数
    - 实现 deserialize() 函数
    - _Requirements: 5.5, 5.6_

  - [x] 2.3 编写 UI Schema 往返一致性属性测试
    - **Property 1: UI Schema 往返一致性**
    - **Validates: Requirements 5.5, 5.6, 5.7**

- [x] 3. Schema 验证器实现
  - [x] 3.1 实现 JSON 语法验证
    - 创建 validateJSON() 函数
    - 返回详细的错误位置和信息
    - _Requirements: 2.2_

  - [x] 3.2 编写 JSON 语法验证属性测试
    - **Property 10: JSON 语法验证正确性**
    - **Validates: Requirements 2.2**

  - [x] 3.3 实现 UI Schema 验证
    - 创建 validateUISchema() 函数
    - 验证必填字段（id, type）
    - 验证组件引用完整性
    - _Requirements: 5.3, 2.5_

  - [x] 3.4 编写 Schema 验证完整性属性测试
    - **Property 5: Schema 验证完整性**
    - **Validates: Requirements 5.2, 5.3**

- [x] 4. Checkpoint - 核心数据层验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 数据绑定系统实现
  - [x] 5.1 实现数据绑定表达式解析器
    - 解析 `{{path.to.value}}` 格式表达式
    - 支持数组索引访问 `{{items[0].name}}`
    - 实现 resolveBindings() 函数
    - _Requirements: 5.4_

  - [x] 5.2 编写数据绑定解析属性测试
    - **Property 3: 数据绑定表达式解析**
    - **Validates: Requirements 5.4**

  - [x] 5.3 实现数据字段提取器
    - 从 UISchema 中提取所有数据绑定字段
    - 实现 extractDataFields() 函数
    - _Requirements: 3.1_

  - [x] 5.4 编写数据字段提取属性测试
    - **Property 6: 数据字段提取完整性**
    - **Validates: Requirements 3.1**

- [x] 6. 组件注册表实现
  - [x] 6.1 实现 ComponentRegistry 类
    - 实现 register()、get()、getAll()、has() 方法
    - 实现组件定义验证
    - _Requirements: 6.2, 6.4_

  - [x] 6.2 编写组件注册表属性测试
    - **Property 4: 组件注册表查找一致性**
    - **Validates: Requirements 6.2, 6.4**

  - [x] 6.3 注册 shadcn-ui 基础组件
    - 注册 Button、Input、Card、Table 等组件
    - 为每个组件定义 propsSchema
    - _Requirements: 6.1, 6.3_

- [x] 7. Checkpoint - 核心服务层验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 8. 渲染器实现
  - [x] 8.1 实现 Renderer 核心逻辑
    - 创建 render() 函数
    - 实现组件树递归渲染
    - 集成数据绑定解析
    - _Requirements: 7.1_

  - [x] 8.2 实现事件处理系统
    - 处理组件事件绑定
    - 实现 onEvent 回调机制
    - _Requirements: 4.4_

  - [x] 8.3 编写 Schema 框架无关性属性测试
    - **Property 11: Schema 框架无关性**
    - **Validates: Requirements 7.5**

- [x] 9. LLM 服务实现
  - [x] 9.1 实现 LLM 配置管理
    - 创建 LLMConfig 接口实现
    - 支持 OpenAI、Anthropic 等提供商
    - _Requirements: 8.1_

  - [x] 9.2 实现流式响应处理
    - 实现 sendMessage() 异步迭代器
    - 处理流式 JSON 片段
    - _Requirements: 8.2, 8.3_

  - [x] 9.3 实现 JSON 提取器
    - 从 LLM 响应中提取 JSON 代码块
    - 实现 extractUISchema() 函数
    - _Requirements: 1.3, 8.4_

  - [x] 9.4 编写 JSON 提取属性测试
    - **Property 2: JSON 提取正确性**
    - **Validates: Requirements 1.3, 8.4**

- [x] 10. Checkpoint - 服务层验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 11. 状态管理实现
  - [x] 11.1 实现对话状态管理
    - 创建 ChatMessage、Conversation 类型
    - 实现消息历史存储
    - _Requirements: 1.6, 8.6_

  - [x] 11.2 编写消息历史属性测试
    - **Property 7: 消息历史完整性**
    - **Validates: Requirements 1.1, 1.6, 8.6**

  - [x] 11.3 实现编辑器状态管理
    - 创建 EditorState 类型
    - 实现 JSON 内容与解析状态同步
    - _Requirements: 2.3_

  - [x] 11.4 实现布局状态管理
    - 创建 LayoutState 类型
    - 实现布局偏好持久化（localStorage）
    - _Requirements: 10.5_

  - [x] 11.5 编写布局状态持久化属性测试
    - **Property 9: 布局状态持久化**
    - **Validates: Requirements 10.5**

- [x] 12. UI 组件实现 - Chat 界面
  - [x] 12.1 实现 ChatInterface 组件
    - 消息列表显示
    - 输入框与发送按钮
    - 流式响应显示
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 12.2 实现消息气泡组件
    - 用户消息样式
    - AI 消息样式（支持 JSON 高亮）
    - 加载状态指示器
    - _Requirements: 1.2, 1.4_

  - [x] 12.3 实现历史记录功能
    - 历史对话列表
    - 点击加载历史 Schema
    - _Requirements: 1.6, 1.7_

- [-] 13. UI 组件实现 - 编辑器区域
  - [x] 13.1 实现 JSON Schema 编辑器
    - 集成 Monaco Editor 或 CodeMirror
    - 语法高亮与错误标记
    - 代码折叠与搜索
    - _Requirements: 2.1, 2.4, 2.7_

  - [x] 13.2 实现 Data Binding 编辑器
    - 数据字段列表显示
    - 值编辑功能
    - 类型验证与警告
    - _Requirements: 3.2, 3.4, 3.6_

  - [x] 13.3 实现图片上传功能
    - 本地图片选择
    - Base64 转换
    - _Requirements: 3.5_

- [x] 14. UI 组件实现 - 预览面板
  - [x] 14.1 实现 PreviewPanel 组件
    - 集成 Renderer
    - 实时更新渲染
    - _Requirements: 4.1_

  - [x] 14.2 实现响应式预览
    - 设备视图切换（桌面/平板/手机）
    - 预览容器尺寸调整
    - _Requirements: 4.3_

  - [x] 14.3 实现主题切换
    - 深色/浅色主题
    - 主题状态持久化
    - _Requirements: 4.6_

  - [x] 14.4 实现错误边界
    - 未知组件占位符
    - 渲染错误提示
    - _Requirements: 4.5_

- [x] 15. Checkpoint - UI 组件验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 16. 三栏布局实现
  - [x] 16.1 实现可调整宽度的布局
    - 拖拽分隔条
    - 宽度百分比计算
    - _Requirements: 10.1, 10.2_

  - [x] 16.2 实现面板折叠功能
    - 折叠/展开按钮
    - 动画过渡效果
    - _Requirements: 10.3_

  - [x] 16.3 实现响应式布局
    - 窄屏标签页模式
    - 断点检测
    - _Requirements: 10.4_

- [x] 17. 导出功能实现
  - [x] 17.1 实现 JSON 导出
    - 导出完整 UISchema
    - 包含 DataContext
    - _Requirements: 9.1, 7.2, 7.3_

  - [x] 17.2 实现 Vue3 代码导出
    - 生成 Vue SFC 代码
    - 包含依赖声明
    - _Requirements: 9.2_

  - [x] 17.3 实现 React 代码导出
    - 生成 JSX 代码
    - 包含依赖声明
    - _Requirements: 9.3_

  - [x] 17.4 编写代码导出属性测试
    - **Property 8: 代码导出语法正确性**
    - **Validates: Requirements 9.2, 9.3, 9.4**

- [x] 18. 错误处理与https://github.com/astercloud/aster.git边界情况
  - [x] 18.1 实现网络错误处理
    - 重试机制
    - 错误提示 UI
    - _Requirements: 1.5_

  - [x] 18.2 实现 Schema 错误处理
    - 验证错误显示
    - 修复建议
    - _Requirements: 2.6_

  - [x] 18.3 实现未知组件处理
    - 占位符组件
    - 错误日志
    - _Requirements: 6.5_

- [x] 19. Final Checkpoint - 完整系统验证
  - 确保所有测试通过
  - 验证端到端流程
  - 如有问题请询问用户

## Notes

- 所有任务均为必需，包括属性测试任务
- 每个任务都引用了具体的需求以确保可追溯性
- Checkpoint 任务用于阶段性验证
- 属性测试使用 fast-check 库，每个测试至少运行 100 次迭代

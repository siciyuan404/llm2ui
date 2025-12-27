# editor

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

编辑器组件目录，提供 JSON Schema 编辑、数据绑定管理和错误处理功能。
基于 Monaco Editor 实现语法高亮、错误标记、代码折叠等功能。

## 文件索引

| 文件名 | 功能描述 |
|--------|----------|
| index.ts | 组件导出入口 |
| JsonSchemaEditor.tsx | JSON Schema 编辑器，Monaco Editor 集成、语法高亮、错误标记、验证 |
| DataBindingEditor.tsx | 数据绑定编辑器，显示和编辑 Schema 中的数据绑定字段 |
| ImageUpload.tsx | 图片上传组件，本地图片选择、Base64 转换 |
| SchemaErrorPanel.tsx | Schema 错误面板，显示验证错误、修复建议、自动修复功能 |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。

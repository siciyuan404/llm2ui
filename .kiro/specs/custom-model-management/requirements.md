# Requirements Document

## Introduction

本功能为 LLM2UI 系统添加自定义模型管理能力，使用户能够手动添加、编辑和删除 LLM 模型配置。目前系统只支持预定义的提供商和模型列表，用户无法添加新的模型（如新发布的 GPT 模型、Claude 模型或其他兼容 API 的模型）。本功能将允许用户自由扩展可用模型列表，并持久化保存自定义配置。

## Glossary

- **Custom_Model**: 用户自定义的模型配置，包含模型名称、所属提供商、API 端点等信息
- **Model_Manager**: 模型管理器，负责自定义模型的增删改查和持久化
- **Model_List**: 模型列表界面，显示所有可用模型（预设 + 自定义）
- **Provider_Extension**: 提供商扩展，允许为现有提供商添加新模型

## Requirements

### Requirement 1: 自定义模型添加

**User Story:** 作为用户，我希望能够手动添加新的 LLM 模型，以便使用最新发布的模型或私有部署的模型。

#### Acceptance Criteria

1. THE Model_Manager SHALL 提供添加自定义模型的功能
2. WHEN 用户添加自定义模型时，THE System SHALL 要求输入模型名称（必填）
3. WHEN 用户添加自定义模型时，THE System SHALL 允许选择所属提供商或创建新提供商
4. WHEN 用户添加自定义模型时，THE System SHALL 允许输入自定义 API 端点（可选）
5. THE System SHALL 验证模型名称不能为空且不能与现有模型重复
6. WHEN 模型添加成功时，THE System SHALL 立即在模型选择列表中显示新模型

### Requirement 2: 自定义模型编辑

**User Story:** 作为用户，我希望能够编辑已添加的自定义模型配置，以便修正错误或更新配置。

#### Acceptance Criteria

1. THE Model_Manager SHALL 允许编辑用户添加的自定义模型
2. THE System SHALL NOT 允许编辑系统预设的模型
3. WHEN 用户编辑模型时，THE System SHALL 显示当前配置作为默认值
4. WHEN 编辑保存成功时，THE System SHALL 更新所有使用该模型的配置

### Requirement 3: 自定义模型删除

**User Story:** 作为用户，我希望能够删除不再需要的自定义模型，以保持模型列表整洁。

#### Acceptance Criteria

1. THE Model_Manager SHALL 允许删除用户添加的自定义模型
2. THE System SHALL NOT 允许删除系统预设的模型
3. WHEN 用户尝试删除模型时，THE System SHALL 显示确认对话框
4. IF 被删除的模型正在被某个配置使用，THEN THE System SHALL 警告用户并要求确认

### Requirement 4: 模型配置持久化

**User Story:** 作为用户，我希望自定义模型配置能够持久化保存，以便下次打开应用时仍然可用。

#### Acceptance Criteria

1. THE Model_Manager SHALL 将自定义模型配置保存到本地存储
2. WHEN 应用启动时，THE System SHALL 自动加载已保存的自定义模型
3. FOR ALL 有效的自定义模型配置，保存后再加载 SHALL 产生等价的配置（往返一致性）

### Requirement 5: 模型管理界面

**User Story:** 作为用户，我希望有一个专门的界面来管理所有模型，以便方便地查看、添加和管理模型。

#### Acceptance Criteria

1. THE System SHALL 在 LLM 设置对话框中提供"管理模型"入口
2. THE Model_List SHALL 分组显示预设模型和自定义模型
3. THE Model_List SHALL 为自定义模型显示编辑和删除按钮
4. THE Model_List SHALL 为预设模型显示"预设"标签，不显示编辑/删除按钮
5. THE System SHALL 提供搜索/过滤功能，方便在大量模型中查找

### Requirement 6: 提供商模型扩展

**User Story:** 作为用户，我希望能够为现有提供商（如 OpenAI）添加新模型，而不必创建新的提供商配置。

#### Acceptance Criteria

1. WHEN 用户添加模型时，THE System SHALL 允许选择现有提供商
2. WHEN 为现有提供商添加模型时，THE System SHALL 自动继承该提供商的默认端点
3. THE System SHALL 在模型选择下拉菜单中将自定义模型与预设模型一起显示
4. THE System SHALL 用视觉标记区分预设模型和自定义模型


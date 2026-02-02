/**
 * @file settings-form-example.tsx
 * @description 设置表单组件使用示例
 * @module components/examples/settings-form-example
 *
 * 展示如何使用 SettingsPanel、SettingsSection、SettingRow 和各类表单控件
 * 构建一个完整的设置面板。
 */

import * as React from "react"

import { SettingsPanel } from "@/components/ui/settings-panel"
import { SettingsSection, SettingsSectionGroup } from "@/components/ui/settings-section"
import {
  SwitchField,
  SelectField,
  SliderField,
  InputField,
} from "@/components/ui/setting-controls"

interface SettingsFormExampleProps {
  /** 关闭回调 */
  onClose?: () => void
}

export function SettingsFormExample({ onClose }: SettingsFormExampleProps) {
  // 状态管理
  const [fontSize, setFontSize] = React.useState([14])
  const [showPrompt, setShowPrompt] = React.useState(true)
  const [useSerifFont, setUseSerifFont] = React.useState(false)
  const [autoFoldThinking, setAutoFoldThinking] = React.useState(true)
  const [messageStyle, setMessageStyle] = React.useState("simple")
  const [mathEngine, setMathEngine] = React.useState("katex")
  const [codeStyle, setCodeStyle] = React.useState("auto")

  return (
    <SettingsPanel title="设置" onClose={onClose}>
      <SettingsSectionGroup>
        {/* 消息设置 */}
        <SettingsSection title="消息设置">
          <SwitchField
            label="显示提示词"
            checked={showPrompt}
            onCheckedChange={setShowPrompt}
          />

          <SwitchField
            label="使用衬线字体"
            checked={useSerifFont}
            onCheckedChange={setUseSerifFont}
          />

          <SwitchField
            label="思考内容自动折叠"
            helpText="AI 的思考过程会自动折叠，点击可展开查看"
            checked={autoFoldThinking}
            onCheckedChange={setAutoFoldThinking}
          />

          <SwitchField
            label="显示消息大纲"
            defaultChecked={false}
          />

          <SelectField
            label="消息样式"
            options={[
              { value: "simple", label: "简洁" },
              { value: "bubble", label: "气泡" },
            ]}
            value={messageStyle}
            onValueChange={setMessageStyle}
          />

          <SelectField
            label="多模型回答样式"
            options={[
              { value: "tag", label: "标签模式" },
              { value: "split", label: "分栏模式" },
            ]}
            defaultValue="tag"
          />

          <SelectField
            label="对话导航按钮"
            options={[
              { value: "none", label: "不显示" },
              { value: "show", label: "显示" },
            ]}
            defaultValue="none"
          />

          <SliderField
            label="消息字体大小"
            value={fontSize}
            onValueChange={setFontSize}
            min={12}
            max={24}
            step={1}
            showValue
            formatValue={(v) => `${v}px`}
            showRangeLabels
            minLabel="A"
            maxLabel="A"
            centerLabel="默认"
          />
        </SettingsSection>

        {/* 数学公式设置 */}
        <SettingsSection title="数学公式设置">
          <SelectField
            label="数学公式引擎"
            options={[
              { value: "katex", label: "KaTeX" },
              { value: "mathjax", label: "MathJax" },
            ]}
            value={mathEngine}
            onValueChange={setMathEngine}
          />

          <SwitchField
            label="启用 $...$"
            helpText="使用单个美元符号包裹行内公式"
            defaultChecked
          />
        </SettingsSection>

        {/* 代码块设置 */}
        <SettingsSection title="代码块设置">
          <SelectField
            label="代码风格"
            options={[
              { value: "auto", label: "auto" },
              { value: "dark", label: "dark" },
              { value: "light", label: "light" },
            ]}
            value={codeStyle}
            onValueChange={setCodeStyle}
          />

          <SwitchField
            label="花式代码块"
            helpText="使用更美观的代码块样式"
            defaultChecked
          />

          <SwitchField
            label="代码执行"
            helpText="允许在沙箱中执行代码"
            defaultChecked={false}
          />

          <SwitchField
            label="代码编辑器"
            defaultChecked={false}
          />

          <SwitchField
            label="代码显示行号"
            defaultChecked={false}
          />

          <SwitchField
            label="代码块可折叠"
            defaultChecked={false}
          />

          <SwitchField
            label="代码块可换行"
            defaultChecked={false}
          />

          <SwitchField
            label="启用预览工具"
            helpText="支持 Mermaid、SVG 等预览"
            defaultChecked={false}
          />
        </SettingsSection>

        {/* 输入设置 */}
        <SettingsSection title="输入设置">
          <SwitchField
            label="显示预估 Token 数"
            defaultChecked={false}
          />

          <SwitchField
            label="长文本粘贴为文件"
            defaultChecked={false}
          />

          <SwitchField
            label="Markdown 渲染输入消息"
            defaultChecked={false}
          />

          <SwitchField
            label="3 个空格快速翻译"
            defaultChecked={false}
          />
        </SettingsSection>

        {/* 高级设置示例 */}
        <SettingsSection title="高级设置" defaultOpen={false}>
          <InputField
            label="API 端点"
            placeholder="https://api.example.com"
            inputWidth="150px"
          />

          <InputField
            label="超时时间"
            type="number"
            defaultValue="30"
            helpText="请求超时时间（秒）"
            inputWidth="80px"
          />

          <SliderField
            label="温度参数"
            defaultValue={[0.7]}
            min={0}
            max={2}
            step={0.1}
            showValue
            formatValue={(v) => v.toFixed(1)}
          />

          <SliderField
            label="最大 Token 数"
            defaultValue={[2048]}
            min={256}
            max={8192}
            step={256}
            showValue
          />
        </SettingsSection>
      </SettingsSectionGroup>
    </SettingsPanel>
  )
}

export default SettingsFormExample

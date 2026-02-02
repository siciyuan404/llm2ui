/**
 * @file setting-controls.tsx
 * @description 设置表单控件组件集合
 * @module components/ui/setting-controls
 *
 * 提供预封装的表单控件，结合 SettingRow 使用。
 * 包含 SwitchField、SelectField、SliderField 等。
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingRow } from "@/components/ui/setting-row"

// ============================================================================
// SwitchField - 开关表单控件
// ============================================================================

interface SwitchFieldProps {
  /** 标签文本 */
  label: string
  /** 帮助提示文本 */
  helpText?: string
  /** 描述文本 */
  description?: string
  /** 当前值 */
  checked?: boolean
  /** 默认值（非受控模式） */
  defaultChecked?: boolean
  /** 值变化回调 */
  onCheckedChange?: (checked: boolean) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
}

function SwitchField({
  label,
  helpText,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
}: SwitchFieldProps) {
  return (
    <SettingRow
      label={label}
      helpText={helpText}
      description={description}
      disabled={disabled}
      className={className}
    >
      <Switch
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </SettingRow>
  )
}

// ============================================================================
// SelectField - 下拉选择表单控件
// ============================================================================

interface SelectOption {
  /** 选项值 */
  value: string
  /** 选项显示文本 */
  label: string
}

interface SelectFieldProps {
  /** 标签文本 */
  label: string
  /** 帮助提示文本 */
  helpText?: string
  /** 描述文本 */
  description?: string
  /** 选项列表 */
  options: SelectOption[]
  /** 当前值 */
  value?: string
  /** 默认值（非受控模式） */
  defaultValue?: string
  /** 值变化回调 */
  onValueChange?: (value: string) => void
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 选择器宽度 */
  selectWidth?: string
}

function SelectField({
  label,
  helpText,
  description,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  className,
  selectWidth = "100px",
}: SelectFieldProps) {
  return (
    <SettingRow
      label={label}
      helpText={helpText}
      description={description}
      disabled={disabled}
      className={className}
    >
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn("h-7 text-xs", `w-[${selectWidth}]`)}
          style={{ width: selectWidth }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingRow>
  )
}

// ============================================================================
// SliderField - 滑块表单控件
// ============================================================================

interface SliderFieldProps {
  /** 标签文本 */
  label: string
  /** 帮助提示文本 */
  helpText?: string
  /** 描述文本 */
  description?: string
  /** 当前值 */
  value?: number[]
  /** 默认值（非受控模式） */
  defaultValue?: number[]
  /** 值变化回调 */
  onValueChange?: (value: number[]) => void
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步长 */
  step?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 是否显示当前值 */
  showValue?: boolean
  /** 值格式化函数 */
  formatValue?: (value: number) => string
  /** 是否显示范围标签 */
  showRangeLabels?: boolean
  /** 最小值标签 */
  minLabel?: string
  /** 最大值标签 */
  maxLabel?: string
  /** 中间标签 */
  centerLabel?: string
}

function SliderField({
  label,
  helpText,
  description,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  showValue = true,
  formatValue = (v) => String(v),
  showRangeLabels = false,
  minLabel,
  maxLabel,
  centerLabel,
}: SliderFieldProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? [min])
  const currentValue = value ?? internalValue

  const handleValueChange = (newValue: number[]) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div className={cn("py-2", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-foreground">{label}</span>
        {showValue && (
          <span className="text-xs text-muted-foreground">
            {formatValue(currentValue[0])}
          </span>
        )}
      </div>
      <Slider
        value={currentValue}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      {showRangeLabels && (
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{minLabel ?? min}</span>
          {centerLabel && <span>{centerLabel}</span>}
          <span>{maxLabel ?? max}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// InputField - 输入框表单控件
// ============================================================================

interface InputFieldProps {
  /** 标签文本 */
  label: string
  /** 帮助提示文本 */
  helpText?: string
  /** 描述文本 */
  description?: string
  /** 当前值 */
  value?: string
  /** 默认值（非受控模式） */
  defaultValue?: string
  /** 值变化回调 */
  onChange?: (value: string) => void
  /** 占位符文本 */
  placeholder?: string
  /** 输入类型 */
  type?: "text" | "number" | "password" | "email"
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 输入框宽度 */
  inputWidth?: string
}

function InputField({
  label,
  helpText,
  description,
  value,
  defaultValue,
  onChange,
  placeholder,
  type = "text",
  disabled,
  className,
  inputWidth = "120px",
}: InputFieldProps) {
  return (
    <SettingRow
      label={label}
      helpText={helpText}
      description={description}
      disabled={disabled}
      className={className}
    >
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-7 px-2 text-xs rounded-md border border-input bg-background",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        style={{ width: inputWidth }}
      />
    </SettingRow>
  )
}

export {
  SwitchField,
  SelectField,
  SliderField,
  InputField,
}
export type {
  SwitchFieldProps,
  SelectFieldProps,
  SelectOption,
  SliderFieldProps,
  InputFieldProps,
}

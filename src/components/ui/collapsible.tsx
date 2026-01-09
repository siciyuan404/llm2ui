/**
 * Collapsible Component
 * 
 * 可折叠组件，用于显示/隐藏内容区域。
 * 基于 Radix UI Collapsible 构建，支持受控和非受控模式。
 * 
 * @module components/ui/collapsible
 */

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

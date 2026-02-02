/**
 * @file sidebar.tsx
 * @description 侧边栏组件，基于 shadcn-ui v4 实现
 * @module components/ui/sidebar
 * 
 * 用于创建可折叠的侧边栏导航。
 * 基于 Sheet 组件构建。
 */

import * as React from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

function Sidebar({
  className,
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "flex flex-col border-r bg-background",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex h-14 items-center border-b px-4",
        className
      )}
      {...props}
    />
  )
}

function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "flex h-14 items-center border-t px-4",
        className
      )}
      {...props}
    />
  )
}

function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex-1 overflow-auto py-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn(
        "px-2 py-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "mb-2 px-2 text-xs font-semibold text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn(
        "space-y-1",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn(
        "space-y-1",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn(
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        className
      )}
      {...props}
    />
  )
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        className
      )}
      {...props}
    >
      <PanelLeftOpen className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarCollapsible({
  className,
  ...props
}: React.ComponentProps<typeof Sheet>) {
  return (
    <Sheet {...props}>
      <SheetContent
        side="left"
        className={cn(
          "w-64 p-0",
          className
        )}
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// AppSidebar 组件 - 图标导航栏风格
// 类似 cherry-studio 的图标导航栏，始终显示在应用左侧
// ============================================================================

/**
 * AppSidebar 容器组件
 * 垂直图标导航栏的根容器
 */
function AppSidebar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-sidebar"
      className={cn(
        "flex flex-col items-center w-14 min-w-14 h-screen py-3 bg-card border-r border-border",
        className
      )}
      {...props}
    />
  )
}

/**
 * AppSidebar Logo 容器
 * 用于放置应用 Logo
 */
function AppSidebarLogo({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-sidebar-logo"
      className={cn(
        "w-9 h-9 flex items-center justify-center mb-4 cursor-pointer transition-transform hover:scale-105",
        className
      )}
      {...props}
    />
  )
}

/**
 * AppSidebar 菜单容器
 * 用于放置主要导航菜单项
 */
function AppSidebarMenus({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-sidebar-menus"
      className={cn(
        "flex flex-col flex-1 gap-1 overflow-y-auto overflow-x-hidden scrollbar-hide",
        className
      )}
      {...props}
    />
  )
}

/**
 * AppSidebar 底部菜单容器
 * 用于放置设置、主题切换等底部操作
 */
function AppSidebarBottomMenus({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-sidebar-bottom-menus"
      className={cn(
        "flex flex-col gap-1 mt-auto pt-2 border-t border-border",
        className
      )}
      {...props}
    />
  )
}

/**
 * AppSidebar 图标按钮
 * 支持 active 状态的图标按钮
 */
interface AppSidebarIconButtonProps extends React.ComponentProps<"button"> {
  /** 是否为激活状态 */
  active?: boolean;
}

function AppSidebarIconButton({
  className,
  active = false,
  ...props
}: AppSidebarIconButtonProps) {
  return (
    <button
      data-slot="app-sidebar-icon-button"
      data-active={active}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-xl border-none cursor-pointer transition-all",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        "[&_svg]:w-5 [&_svg]:h-5",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarCollapsible,
  // AppSidebar 组件
  AppSidebar,
  AppSidebarLogo,
  AppSidebarMenus,
  AppSidebarBottomMenus,
  AppSidebarIconButton,
}
/**
 * @file Navbar 组件
 * @description 水平顶部导航栏，支持 Left/Center/Right 布局
 * @module components/cherry/app/Navbar
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** 导航栏高度 */
  height?: number;
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ height = 40, className, style, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center px-3',
          'bg-[var(--cherry-navbar-background)]',
          'border-b border-[var(--cherry-border)]',
          // Electron 窗口拖拽区域
          '[-webkit-app-region:drag]',
          className
        )}
        style={{
          height,
          minHeight: height,
          ...style,
        }}
        {...props}
      >
        {children}
      </header>
    );
  }
);

Navbar.displayName = 'Navbar';

export interface NavbarLeftProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavbarLeft = React.forwardRef<HTMLDivElement, NavbarLeftProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2',
          '[-webkit-app-region:no-drag]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NavbarLeft.displayName = 'NavbarLeft';

export interface NavbarCenterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavbarCenter = React.forwardRef<HTMLDivElement, NavbarCenterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex-1 flex items-center justify-center gap-2',
          '[-webkit-app-region:no-drag]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NavbarCenter.displayName = 'NavbarCenter';

export interface NavbarRightProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NavbarRight = React.forwardRef<HTMLDivElement, NavbarRightProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2',
          '[-webkit-app-region:no-drag]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NavbarRight.displayName = 'NavbarRight';

/**
 * @file ThemeCard.tsx
 * @description 主题卡片组件 - 显示主题信息和操作按钮
 * @module components/showcase
 * @requirements 11.4, 19.3
 */

import * as React from 'react';
import { Check, Download, Trash2, ExternalLink, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { ThemeMetadata } from '@/lib/themes';

// ============================================================================
// Types
// ============================================================================

export interface ThemeCardProps {
  /** 主题元数据 */
  theme: ThemeMetadata;
  /** 是否为当前激活的主题 */
  isActive?: boolean;
  /** 是否正在安装/卸载 */
  isLoading?: boolean;
  /** 点击卡片回调 */
  onClick?: () => void;
  /** 安装主题回调 */
  onInstall?: () => void;
  /** 卸载主题回调 */
  onUninstall?: () => void;
  /** 激活主题回调 */
  onActivate?: () => void;
  /** 查看详情回调 */
  onViewDetails?: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ThemeCard - 主题卡片组件
 * 
 * 功能：
 * - 显示主题名称、描述、预览图
 * - 显示安装/卸载按钮
 * - 显示激活状态
 * 
 * @requirements 11.4, 19.3
 */
export function ThemeCard({
  theme,
  isActive = false,
  isLoading = false,
  onClick,
  onInstall,
  onUninstall,
  onActivate,
  onViewDetails,
  className,
}: ThemeCardProps) {
  const isBuiltin = theme.category === 'builtin';
  const canUninstall = theme.installed && !isBuiltin && !isActive;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-md cursor-pointer',
        isActive && 'ring-2 ring-primary',
        className
      )}
      onClick={onClick}
    >
      {/* 预览图 */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {theme.previewImage ? (
          <img
            src={theme.previewImage}
            alt={`${theme.name} 预览`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl font-bold opacity-20">
              {theme.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* 激活状态标记 */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="gap-1">
              <Check className="h-3 w-3" />
              当前使用
            </Badge>
          </div>
        )}
        
        {/* 类别标记 */}
        <div className="absolute top-2 left-2">
          <Badge variant={isBuiltin ? 'secondary' : 'outline'}>
            {isBuiltin ? '内置' : '社区'}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{theme.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {theme.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {theme.author && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{theme.author}</span>
            </div>
          )}
          <span>v{theme.version}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 gap-2">
        {theme.installed ? (
          <>
            {!isActive && onActivate && (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate();
                }}
                disabled={isLoading}
                className="flex-1"
              >
                使用此主题
              </Button>
            )}
            {canUninstall && onUninstall && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onUninstall();
                }}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          onInstall && (
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onInstall();
              }}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              安装
            </Button>
          )
        )}
        
        {theme.repository && onViewDetails && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ThemeCard;

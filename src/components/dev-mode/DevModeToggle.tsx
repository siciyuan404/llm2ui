/**
 * @file DevModeToggle.tsx
 * @description 开发者模式开关组件
 * @module components/dev-mode/DevModeToggle
 */

import { useDevMode } from '@/hooks/useDevMode';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * DevModeToggle Props
 */
interface DevModeToggleProps {
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 开发者模式开关组件
 * 
 * 功能：
 * - 切换开发者模式开关
 * - 显示当前状态
 * - 提供使用提示
 */
export function DevModeToggle({ showLabel = true, className = '' }: DevModeToggleProps) {
  const { isDevMode, toggleDevMode } = useDevMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <Switch
              id="dev-mode-toggle"
              checked={isDevMode}
              onCheckedChange={toggleDevMode}
              aria-label="开发者模式"
            />
            {showLabel && (
              <Label
                htmlFor="dev-mode-toggle"
                className="text-sm cursor-pointer select-none"
              >
                开发者模式
              </Label>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs">
            开启后显示组件轮廓，按住 Alt 点击组件可复制组件名和代码位置
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default DevModeToggle;

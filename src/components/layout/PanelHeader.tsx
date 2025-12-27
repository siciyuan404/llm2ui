/**
 * PanelHeader Component
 * 
 * Header component for layout panels with collapse/expand functionality.
 * Implements Requirements 10.3
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { PanelId } from '@/lib/state-management';

export interface PanelHeaderProps {
  /** Panel title */
  title: string;
  /** Panel identifier */
  panelId: PanelId;
  /** Whether the panel is collapsed */
  collapsed: boolean;
  /** Callback to toggle collapse state */
  onToggleCollapse: () => void;
  /** Additional actions to render in the header */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * PanelHeader - Header with title and collapse button for panels
 */
export function PanelHeader({
  title,
  panelId,
  collapsed,
  onToggleCollapse,
  actions,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2',
        'bg-muted/50 border-b border-border',
        'flex-shrink-0',
        className
      )}
    >
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      
      <div className="flex items-center gap-2">
        {actions}
        
        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1 rounded hover:bg-muted transition-colors',
            'text-muted-foreground hover:text-foreground'
          )}
          title={collapsed ? `Expand ${title}` : `Collapse ${title}`}
          aria-label={collapsed ? `Expand ${title} panel` : `Collapse ${title} panel`}
          aria-expanded={!collapsed}
          aria-controls={`panel-${panelId}`}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>
    </div>
  );
}

interface CollapseIconProps {
  collapsed: boolean;
  className?: string;
}

function CollapseIcon({ collapsed, className }: CollapseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'transition-transform duration-200',
        collapsed && 'rotate-180',
        className
      )}
    >
      {collapsed ? (
        // Expand icon (chevron right)
        <polyline points="9 18 15 12 9 6" />
      ) : (
        // Collapse icon (chevron left)
        <polyline points="15 18 9 12 15 6" />
      )}
    </svg>
  );
}

export default PanelHeader;

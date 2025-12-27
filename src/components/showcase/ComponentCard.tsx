/**
 * ComponentCard - Component card display for showcase
 * 
 * Displays a single component in either grid or list view mode.
 * Shows component name, description, category, version, and platform info.
 * Supports selection state, keyboard navigation, theme switching, and variant/state switching.
 * Includes Error Boundary for graceful error handling during preview rendering.
 * 
 * @module ComponentCard
 * @see Requirements 2.1, 2.2, 2.3, 2.4, 15.1, 15.2
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentDefinition } from '@/lib/component-registry';
import type { ViewMode } from './ComponentShowcase';
import { LivePreview, type PreviewState, type PreviewTheme } from './LivePreview';
import { ErrorBoundary, type FallbackProps } from '@/components/preview/ErrorBoundary';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for ComponentCard
 */
export interface ComponentCardProps {
  /** Component definition to display */
  component: ComponentDefinition;
  /** View mode (grid or list) */
  viewMode: ViewMode;
  /** Whether this card is selected */
  isSelected: boolean;
  /** Callback when card is clicked */
  onClick: () => void;
  /** Preview theme (light or dark) */
  theme?: PreviewTheme;
  /** Optional preview renderer */
  renderPreview?: (component: ComponentDefinition) => React.ReactNode;
  /** Whether to show state controls for variant switching */
  showStateControls?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Props for GridCard (internal)
 */
interface GridCardProps {
  component: ComponentDefinition;
  isSelected: boolean;
  onClick: () => void;
  theme?: PreviewTheme;
  renderPreview?: (component: ComponentDefinition) => React.ReactNode;
  showStateControls?: boolean;
  className?: string;
}

/**
 * Props for ListCard (internal)
 */
interface ListCardProps {
  component: ComponentDefinition;
  isSelected: boolean;
  onClick: () => void;
  theme?: PreviewTheme;
  showStateControls?: boolean;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get category display name in Chinese
 */
function getCategoryDisplayName(category: string | undefined): string {
  if (!category) return '未分类';
  const categoryNames: Record<string, string> = {
    'input': '输入',
    'layout': '布局',
    'display': '展示',
    'feedback': '反馈',
    'navigation': '导航',
  };
  return categoryNames[category] || category;
}

/**
 * Get platform count display text
 */
function getPlatformCountText(platforms: string[] | undefined): string {
  if (!platforms || platforms.length === 0) return '全平台';
  return `${platforms.length} 平台`;
}

// ============================================================================
// Icons
// ============================================================================

/**
 * Deprecated warning icon
 */
function DeprecatedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-3.5 h-3.5', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

// ============================================================================
// Error Fallback Components
// ============================================================================

/**
 * Props for CardErrorFallback
 */
interface CardErrorFallbackProps extends FallbackProps {
  /** Component name for display */
  componentName?: string;
  /** Whether to use compact layout */
  compact?: boolean;
}

/**
 * Compact error fallback for card preview area
 * 
 * Displays a user-friendly error message with retry button
 * when component rendering fails.
 * 
 * @see Requirements 2.4, 15.1
 */
function CardErrorFallback({
  error,
  resetErrorBoundary,
  componentName,
  compact = false,
}: CardErrorFallbackProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-full text-center',
        compact ? 'p-2' : 'p-4'
      )}
    >
      <div
        className={cn(
          'bg-destructive/10 border border-destructive/20 rounded-lg w-full',
          compact ? 'p-2' : 'p-3'
        )}
      >
        <svg
          className={cn(
            'mx-auto text-destructive',
            compact ? 'w-5 h-5 mb-1' : 'w-6 h-6 mb-2'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p
          className={cn(
            'text-destructive font-medium',
            compact ? 'text-[10px] mb-1' : 'text-xs mb-1'
          )}
        >
          {componentName ? `${componentName} 渲染失败` : '渲染失败'}
        </p>
        <p
          className={cn(
            'text-muted-foreground truncate',
            compact ? 'text-[9px] mb-1' : 'text-[10px] mb-2'
          )}
          title={error.message}
        >
          {error.message || '未知错误'}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetErrorBoundary();
          }}
          className={cn(
            'bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors',
            compact ? 'px-2 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'
          )}
        >
          重试
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * State labels for display
 */
const STATE_LABELS: Record<PreviewState, string> = {
  default: '默认',
  hover: '悬停',
  disabled: '禁用',
  focus: '聚焦',
  active: '激活',
};

/**
 * Compact state switcher for card preview
 */
function CompactStateSwitcher({
  currentState,
  onStateChange,
  availableStates,
}: {
  currentState: PreviewState;
  onStateChange: (state: PreviewState) => void;
  availableStates: PreviewState[];
}) {
  // Only show if there are multiple states
  if (availableStates.length <= 1) return null;

  return (
    <div 
      className="flex items-center gap-0.5 bg-muted/80 rounded px-1 py-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      {availableStates.map((state) => (
        <button
          key={state}
          onClick={(e) => {
            e.stopPropagation();
            onStateChange(state);
          }}
          className={cn(
            'px-1.5 py-0.5 text-[10px] rounded transition-colors',
            currentState === state
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted-foreground/20 text-muted-foreground'
          )}
          aria-pressed={currentState === state}
          title={STATE_LABELS[state]}
        >
          {STATE_LABELS[state]}
        </button>
      ))}
    </div>
  );
}

/**
 * Get available states for a component based on its props schema
 */
function getAvailableStates(component: ComponentDefinition): PreviewState[] {
  const states: PreviewState[] = ['default'];
  
  // Check if component supports disabled state
  if (component.propsSchema?.disabled) {
    states.push('disabled');
  }
  
  // Most interactive components support hover
  const interactiveCategories = ['input', 'navigation', 'feedback'];
  if (component.category && interactiveCategories.includes(component.category)) {
    states.push('hover');
  }
  
  // Input components typically support focus
  if (component.category === 'input') {
    states.push('focus');
  }

  // Default states if none detected
  return states.length > 1 ? states : ['default', 'hover', 'disabled'];
}

/**
 * Component tags display
 */
function ComponentTags({
  component,
  compact = false,
}: {
  component: ComponentDefinition;
  compact?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-1 flex-wrap', compact && 'gap-1.5')}>
      {/* Category tag */}
      {component.category && (
        <span
          className={cn(
            'px-2 py-0.5 text-xs bg-muted rounded',
            compact && 'px-1.5'
          )}
        >
          {getCategoryDisplayName(component.category)}
        </span>
      )}
      
      {/* Version tag */}
      {component.version && (
        <span
          className={cn(
            'px-2 py-0.5 text-xs bg-muted rounded',
            compact && 'px-1.5'
          )}
        >
          v{component.version}
        </span>
      )}
      
      {/* Platform count tag */}
      <span
        className={cn(
          'px-2 py-0.5 text-xs bg-muted rounded',
          compact && 'px-1.5'
        )}
      >
        {getPlatformCountText(component.platforms)}
      </span>
    </div>
  );
}

/**
 * Deprecated badge component
 */
function DeprecatedBadge({ message }: { message?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-destructive/10 text-destructive rounded"
      title={message || '此组件已废弃'}
    >
      <DeprecatedIcon />
      废弃
    </span>
  );
}

/**
 * Grid view card component with Error Boundary
 * 
 * @see Requirements 2.4, 15.1, 15.2
 */
function GridCard({
  component,
  isSelected,
  onClick,
  theme = 'light',
  renderPreview,
  showStateControls = true,
  className,
}: GridCardProps) {
  const [previewState, setPreviewState] = React.useState<PreviewState>('default');
  const [errorKey, setErrorKey] = React.useState(0);
  const availableStates = React.useMemo(() => getAvailableStates(component), [component]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  // Error reset handler
  const handleErrorReset = React.useCallback(() => {
    setErrorKey((k) => k + 1);
  }, []);

  // Custom error fallback with component name
  const GridErrorFallback = React.useCallback(
    (props: FallbackProps) => (
      <CardErrorFallback
        {...props}
        componentName={component.name}
        compact={false}
      />
    ),
    [component.name]
  );

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`${component.name} 组件${component.deprecated ? '（已废弃）' : ''}`}
      className={cn(
        'flex flex-col p-4 border border-border rounded-lg cursor-pointer transition-all',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'hover:shadow-md',
        isSelected
          ? 'ring-2 ring-primary border-primary bg-primary/5'
          : 'hover:border-primary/50',
        component.deprecated && 'opacity-75',
        className
      )}
    >
      {/* Preview Area */}
      <div className={cn(
        'h-32 mb-3 rounded-md flex flex-col overflow-hidden border border-border/50 transition-colors',
        theme === 'dark' ? 'bg-slate-800' : 'bg-muted/30'
      )}>
        {/* State Controls */}
        {showStateControls && availableStates.length > 1 && (
          <div className={cn(
            'flex justify-center pt-1 pb-0.5 border-b border-border/30',
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-muted/20'
          )}>
            <CompactStateSwitcher
              currentState={previewState}
              onStateChange={setPreviewState}
              availableStates={availableStates}
            />
          </div>
        )}
        
        {/* Preview Content with Error Boundary */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-2">
          <ErrorBoundary
            key={errorKey}
            fallback={GridErrorFallback}
            onReset={handleErrorReset}
          >
            {renderPreview ? (
              renderPreview(component)
            ) : (
              <LivePreview
                component={component}
                state={previewState}
                theme={theme}
                showStateControls={false}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Component Info */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium truncate text-sm" title={component.name}>
            {component.name}
          </h3>
          {component.deprecated && (
            <DeprecatedBadge message={component.deprecationMessage} />
          )}
        </div>
        <p
          className="text-sm text-muted-foreground line-clamp-2"
          title={component.description}
        >
          {component.description || '暂无描述'}
        </p>
      </div>

      {/* Tags */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <ComponentTags component={component} />
      </div>
    </div>
  );
}

/**
 * List view card component with Error Boundary
 * 
 * @see Requirements 2.4, 15.1, 15.2
 */
function ListCard({
  component,
  isSelected,
  onClick,
  theme = 'light',
  showStateControls = true,
  className,
}: ListCardProps) {
  const [previewState, setPreviewState] = React.useState<PreviewState>('default');
  const [errorKey, setErrorKey] = React.useState(0);
  const availableStates = React.useMemo(() => getAvailableStates(component), [component]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  // Error reset handler
  const handleErrorReset = React.useCallback(() => {
    setErrorKey((k) => k + 1);
  }, []);

  // Custom error fallback with component name (compact for list view)
  const ListErrorFallback = React.useCallback(
    (props: FallbackProps) => (
      <CardErrorFallback
        {...props}
        componentName={component.name}
        compact={true}
      />
    ),
    [component.name]
  );

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`${component.name} 组件${component.deprecated ? '（已废弃）' : ''}`}
      className={cn(
        'flex items-center gap-4 p-4 border-b border-border cursor-pointer transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
        isSelected ? 'bg-primary/10' : 'hover:bg-muted/50',
        component.deprecated && 'opacity-75',
        className
      )}
    >
      {/* Preview with state controls and Error Boundary */}
      <div className={cn(
        'flex-shrink-0 w-24 h-16 rounded-md flex flex-col overflow-hidden border border-border/50 transition-colors',
        theme === 'dark' ? 'bg-slate-800' : 'bg-muted/30'
      )}>
        {showStateControls && availableStates.length > 1 && (
          <div 
            className={cn(
              'flex justify-center py-0.5 border-b border-border/30',
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-muted/20'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-0.5">
              {availableStates.slice(0, 3).map((state) => (
                <button
                  key={state}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewState(state);
                  }}
                  className={cn(
                    'px-1 py-0.5 text-[8px] rounded transition-colors',
                    previewState === state
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted-foreground/20 text-muted-foreground'
                  )}
                  aria-pressed={previewState === state}
                  title={STATE_LABELS[state]}
                >
                  {STATE_LABELS[state].slice(0, 2)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-1">
          <ErrorBoundary
            key={errorKey}
            fallback={ListErrorFallback}
            onReset={handleErrorReset}
          >
            <LivePreview
              component={component}
              state={previewState}
              theme={theme}
              showStateControls={false}
              containerStyle={{ transform: 'scale(0.6)', transformOrigin: 'center' }}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate" title={component.name}>
            {component.name}
          </h3>
          {component.deprecated && (
            <DeprecatedBadge message={component.deprecationMessage} />
          )}
        </div>
        <p
          className="text-sm text-muted-foreground truncate"
          title={component.description}
        >
          {component.description || '暂无描述'}
        </p>
      </div>

      {/* Tags */}
      <div className="flex-shrink-0">
        <ComponentTags component={component} compact />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ComponentCard - Displays a component in grid or list view
 * 
 * Features:
 * - Grid view with preview area and state controls
 * - List view with compact layout and state controls
 * - Theme support for light/dark mode preview
 * - Error Boundary for graceful error handling during preview rendering
 * - Deprecated component indication
 * - Keyboard navigation support
 * - Selection state
 * - Custom preview renderer support
 * - Variant/state switching (hover, disabled, focus, active)
 * 
 * @see Requirements 2.1, 2.2, 2.3, 2.4, 15.1, 15.2
 */
export function ComponentCard({
  component,
  viewMode,
  isSelected,
  onClick,
  theme = 'light',
  renderPreview,
  showStateControls = true,
  className,
}: ComponentCardProps) {
  if (viewMode === 'list') {
    return (
      <ListCard
        component={component}
        isSelected={isSelected}
        onClick={onClick}
        theme={theme}
        showStateControls={showStateControls}
        className={className}
      />
    );
  }

  return (
    <GridCard
      component={component}
      isSelected={isSelected}
      onClick={onClick}
      theme={theme}
      renderPreview={renderPreview}
      showStateControls={showStateControls}
      className={className}
    />
  );
}

export default ComponentCard;

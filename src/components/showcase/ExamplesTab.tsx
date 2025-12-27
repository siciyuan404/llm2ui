/**
 * ExamplesTab - Component examples and usage showcase
 * 
 * Displays component usage examples with:
 * - Live preview of each example
 * - JSON Schema code display
 * - One-click copy to clipboard
 * - "Open in Editor" functionality
 * - Version migration guide (version changes between releases)
 * - User custom examples (stored in localStorage)
 * 
 * @module ExamplesTab
 * @see Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 10.5
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentDefinition, ComponentExample, ComponentRegistry } from '@/lib/component-registry';
import { defaultRegistry } from '@/lib/component-registry';
import type { UISchema } from '@/types';
import { ExamplePreview } from './LivePreview';
import { CustomExampleForm } from './CustomExampleForm';
import {
  getExamplesByComponent,
  createExample,
  deleteExample,
  type CustomExample,
} from '@/lib/custom-examples-storage';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for ExamplesTab component
 */
export interface ExamplesTabProps {
  /** Component definition containing examples */
  component: ComponentDefinition;
  /** Callback when "Open in Editor" is clicked */
  onOpenInEditor?: (schema: UISchema) => void;
  /** Component registry for version lookup */
  registry?: ComponentRegistry;
  /** Additional class name */
  className?: string;
}

/**
 * Version change entry for migration guide
 */
export interface VersionChangeEntry {
  /** Version number */
  version: string;
  /** Type of change */
  type: 'breaking' | 'feature' | 'fix' | 'deprecation';
  /** Description of the change */
  description: string;
}

/**
 * Migration guide data structure
 */
export interface MigrationGuide {
  /** Component name */
  componentName: string;
  /** Current version */
  currentVersion: string;
  /** Available versions */
  availableVersions: string[];
  /** Version change entries */
  changes: VersionChangeEntry[];
  /** Whether component is deprecated */
  isDeprecated: boolean;
  /** Deprecation message */
  deprecationMessage?: string;
}

/**
 * Props for ExampleCard component (internal)
 */
interface ExampleCardProps {
  /** Example data */
  example: ComponentExample;
  /** Example index for display */
  index: number;
  /** Callback when "Open in Editor" is clicked */
  onOpenInEditor?: (schema: UISchema) => void;
  /** Whether this is a user custom example */
  isCustom?: boolean;
  /** Callback when delete is clicked (for custom examples) */
  onDelete?: () => void;
}

/**
 * Copy state for tracking clipboard operations
 */
type CopyState = 'idle' | 'copied' | 'error';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format JSON schema for display with proper indentation
 */
function formatSchema(schema: UISchema): string {
  return JSON.stringify(schema, null, 2);
}

/**
 * Copy text to clipboard
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - true if copy succeeded, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch {
      return false;
    }
  }
}

/**
 * Generate migration guide data from component definition
 * @param component - The component definition
 * @param registry - The component registry
 * @returns Migration guide data
 */
export function generateMigrationGuide(
  component: ComponentDefinition,
  registry: ComponentRegistry = defaultRegistry
): MigrationGuide {
  const currentVersion = component.version || '1.0.0';
  const availableVersions = registry.getVersions(component.name);
  
  // Generate change entries based on version history
  // In a real implementation, this would come from component metadata
  const changes: VersionChangeEntry[] = [];
  
  // Add deprecation notice if component is deprecated
  if (component.deprecated) {
    changes.push({
      version: currentVersion,
      type: 'deprecation',
      description: component.deprecationMessage || '此组件已被标记为废弃，请考虑使用替代组件。',
    });
  }
  
  // Generate sample migration notes based on version differences
  // This demonstrates the structure - in production, these would come from component metadata
  if (availableVersions.length > 1) {
    const latestVersion = availableVersions[0];
    // Note: previousVersion could be used for more detailed migration notes
    // const previousVersion = availableVersions[1];
    
    if (latestVersion !== currentVersion) {
      changes.push({
        version: latestVersion,
        type: 'feature',
        description: `新版本 v${latestVersion} 可用，建议升级以获取最新功能和修复。`,
      });
    }
    
    // Add a sample breaking change note for major version differences
    const currentMajor = parseInt(currentVersion.split('.')[0], 10);
    const latestMajor = parseInt(latestVersion.split('.')[0], 10);
    
    if (latestMajor > currentMajor) {
      changes.push({
        version: latestVersion,
        type: 'breaking',
        description: `主版本升级 (v${currentMajor}.x → v${latestMajor}.x)，可能包含不兼容的 API 变更，请查阅文档。`,
      });
    }
  }
  
  return {
    componentName: component.name,
    currentVersion,
    availableVersions,
    changes,
    isDeprecated: component.deprecated ?? false,
    deprecationMessage: component.deprecationMessage,
  };
}

// ============================================================================
// Icons
// ============================================================================

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  );
}

/**
 * History/changelog icon for version changes
 */
function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Warning icon for breaking changes
 */
function BreakingChangeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
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

/**
 * Feature/sparkle icon for new features
 */
function FeatureIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}

/**
 * Bug fix icon
 */
function FixIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Deprecation icon
 */
function DeprecationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  );
}

/**
 * Tag icon for version badge
 */
function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

/**
 * User icon for custom examples
 */
function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

/**
 * Plus icon for add button
 */
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

/**
 * Trash icon for delete button
 */
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

/**
 * System/official icon for system examples
 */
function SystemIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4', className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Copy button with state feedback
 */
function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copyState, setCopyState] = React.useState<CopyState>('idle');

  const handleCopy = React.useCallback(async () => {
    const success = await copyToClipboard(text);
    setCopyState(success ? 'copied' : 'error');
    
    // Reset state after 2 seconds
    setTimeout(() => {
      setCopyState('idle');
    }, 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
        copyState === 'copied'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : copyState === 'error'
          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground',
        className
      )}
      title={copyState === 'copied' ? '已复制' : '复制 Schema'}
    >
      {copyState === 'copied' ? (
        <>
          <CheckIcon />
          已复制
        </>
      ) : (
        <>
          <CopyIcon />
          复制
        </>
      )}
    </button>
  );
}

/**
 * Open in Editor button
 */
function OpenInEditorButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      title="在编辑器中打开"
    >
      <ExternalLinkIcon />
      在编辑器中打开
    </button>
  );
}

/**
 * Code block with syntax highlighting placeholder
 */
function CodeBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const lines = code.split('\n');
  const shouldCollapse = lines.length > 15;
  const displayCode = shouldCollapse && !isExpanded
    ? lines.slice(0, 12).join('\n') + '\n...'
    : code;

  return (
    <div className={cn('relative', className)}>
      <pre
        className={cn(
          'p-4 bg-muted/50 rounded-md overflow-x-auto text-xs font-mono',
          'border border-border/50',
          shouldCollapse && !isExpanded && 'max-h-72'
        )}
      >
        <code className="text-foreground">{displayCode}</code>
      </pre>
      {shouldCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-2 right-2 px-2 py-1 text-xs bg-background/80 hover:bg-background border border-border rounded transition-colors"
        >
          {isExpanded ? '收起' : `展开 (${lines.length} 行)`}
        </button>
      )}
    </div>
  );
}

/**
 * Single example card component
 */
function ExampleCard({
  example,
  index,
  onOpenInEditor,
  isCustom = false,
  onDelete,
}: ExampleCardProps) {
  const [showCode, setShowCode] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const formattedSchema = React.useMemo(
    () => formatSchema(example.schema),
    [example.schema]
  );

  const handleDelete = React.useCallback(() => {
    if (onDelete) {
      onDelete();
      setShowDeleteConfirm(false);
    }
  }, [onDelete]);

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden',
      isCustom 
        ? 'border-purple-200 dark:border-purple-800' 
        : 'border-border'
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-4 border-b',
        isCustom 
          ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800' 
          : 'bg-muted/30 border-border'
      )}>
        <div className="flex items-center gap-2">
          {/* Example type badge */}
          {isCustom ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              <UserIcon className="w-3 h-3" />
              用户案例
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <SystemIcon className="w-3 h-3" />
              系统案例
            </span>
          )}
          <div>
            <h4 className="font-medium text-sm">
              {example.title || `案例 ${index + 1}`}
            </h4>
            {example.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {example.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* One-click copy Schema - Requirements 11.3 */}
          <CopyButton text={formattedSchema} />
          <button
            onClick={() => setShowCode(!showCode)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              showCode
                ? 'bg-primary/10 text-primary'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            )}
            title={showCode ? '隐藏代码' : '显示代码'}
          >
            <CodeIcon />
            {showCode ? '隐藏代码' : '查看代码'}
          </button>
          {/* Open in Editor - Requirements 11.4 */}
          {onOpenInEditor && (
            <OpenInEditorButton
              onClick={() => onOpenInEditor(example.schema)}
            />
          )}
          {/* Delete button for custom examples */}
          {isCustom && onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
              title="删除案例"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            确定要删除这个案例吗？此操作无法撤销。
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              确认删除
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="p-4 bg-background">
        {example.preview ? (
          <div className="flex items-center justify-center">
            <img
              src={example.preview}
              alt={example.title}
              className="max-w-full h-auto rounded-md border border-border"
            />
          </div>
        ) : (
          <ExamplePreview
            schema={example.schema}
            className="min-h-[100px]"
          />
        )}
      </div>

      {/* Code Section */}
      {showCode && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between p-3 bg-muted/20 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">
              JSON Schema
            </span>
            <div className="flex items-center gap-2">
              <CopyButton text={formattedSchema} />
              {onOpenInEditor && (
                <OpenInEditorButton
                  onClick={() => onOpenInEditor(example.schema)}
                />
              )}
            </div>
          </div>
          <div className="p-3">
            <CodeBlock code={formattedSchema} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Empty state when no examples are available
 */
function EmptyExamplesState({ componentName }: { componentName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="w-12 h-12 text-muted-foreground/50 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <p className="text-sm text-muted-foreground">
        {componentName} 暂无使用案例
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        案例可以帮助您快速了解组件的实际应用场景
      </p>
    </div>
  );
}

/**
 * Get icon component for change type
 */
function getChangeTypeIcon(type: VersionChangeEntry['type']) {
  switch (type) {
    case 'breaking':
      return BreakingChangeIcon;
    case 'feature':
      return FeatureIcon;
    case 'fix':
      return FixIcon;
    case 'deprecation':
      return DeprecationIcon;
    default:
      return HistoryIcon;
  }
}

/**
 * Get styling for change type
 */
function getChangeTypeStyles(type: VersionChangeEntry['type']) {
  switch (type) {
    case 'breaking':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        label: '破坏性变更',
      };
    case 'feature':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        label: '新功能',
      };
    case 'fix':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        label: '修复',
      };
    case 'deprecation':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        label: '废弃',
      };
    default:
      return {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-border',
        label: '变更',
      };
  }
}

/**
 * Single version change entry display
 */
function VersionChangeItem({ change }: { change: VersionChangeEntry }) {
  const Icon = getChangeTypeIcon(change.type);
  const styles = getChangeTypeStyles(change.type);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-md border',
        styles.bg,
        styles.border
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', styles.text)}>
        <Icon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', styles.bg, styles.text)}>
            {styles.label}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            v{change.version}
          </span>
        </div>
        <p className={cn('text-sm', styles.text)}>
          {change.description}
        </p>
      </div>
    </div>
  );
}

/**
 * Migration guide section component
 * Displays version changes and migration information
 * @see Requirements 10.5
 */
function MigrationGuideSection({
  guide,
  className,
}: {
  guide: MigrationGuide;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  // Don't render if no changes to show
  if (guide.changes.length === 0 && guide.availableVersions.length <= 1) {
    return null;
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <HistoryIcon className="text-muted-foreground" />
          <span className="font-medium text-sm">版本迁移指南</span>
          <span className="text-xs text-muted-foreground">
            (当前: v{guide.currentVersion})
          </span>
        </div>
        <svg
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Version info */}
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
            <span className="text-xs text-muted-foreground">可用版本:</span>
            {guide.availableVersions.length > 0 ? (
              guide.availableVersions.map((version, index) => (
                <span
                  key={version}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded',
                    version === guide.currentVersion
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <TagIcon className="w-3 h-3" />
                  v{version}
                  {index === 0 && (
                    <span className="ml-1 px-1 py-0.5 text-[9px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                      最新
                    </span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">v{guide.currentVersion}</span>
            )}
          </div>

          {/* Changes list */}
          {guide.changes.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                版本变更说明
              </h4>
              {guide.changes.map((change, index) => (
                <VersionChangeItem key={`${change.version}-${index}`} change={change} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                当前版本为最新版本，无需迁移
              </p>
            </div>
          )}

          {/* Migration tips */}
          {guide.changes.some(c => c.type === 'breaking') && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
              <h5 className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                迁移提示
              </h5>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                此组件包含破坏性变更。升级前请仔细阅读变更说明，并在测试环境中验证兼容性。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ExamplesTab - Displays component usage examples
 * 
 * Features:
 * - Shows all examples defined in component definition
 * - Live preview of each example
 * - JSON Schema code display with syntax highlighting
 * - One-click copy to clipboard
 * - "Open in Editor" functionality
 * - Collapsible code blocks for long schemas
 * - Empty state for components without examples
 * - Version migration guide with change history
 * - User custom examples with add/delete functionality
 * 
 * @see Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 10.5
 */
export function ExamplesTab({
  component,
  onOpenInEditor,
  registry = defaultRegistry,
  className,
}: ExamplesTabProps) {
  const systemExamples = component.examples;
  const hasSystemExamples = systemExamples && systemExamples.length > 0;

  // Custom examples state
  const [customExamples, setCustomExamples] = React.useState<CustomExample[]>([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Load custom examples from localStorage
  React.useEffect(() => {
    const examples = getExamplesByComponent(component.name);
    setCustomExamples(examples);
  }, [component.name, refreshKey]);

  // Generate migration guide data
  const migrationGuide = React.useMemo(
    () => generateMigrationGuide(component, registry),
    [component, registry]
  );

  // Check if migration guide should be shown
  const showMigrationGuide = migrationGuide.changes.length > 0 || 
    migrationGuide.availableVersions.length > 1;

  // Handle adding a new custom example
  const handleAddExample = React.useCallback(
    (exampleData: Omit<CustomExample, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = createExample({
        title: exampleData.title,
        description: exampleData.description,
        schema: exampleData.schema,
        componentName: exampleData.componentName,
      });
      
      if (result.success) {
        setRefreshKey((k) => k + 1);
        setShowAddForm(false);
      }
    },
    []
  );

  // Handle deleting a custom example
  const handleDeleteExample = React.useCallback((id: string) => {
    const result = deleteExample(id);
    if (result.success) {
      setRefreshKey((k) => k + 1);
    }
  }, []);

  // Convert custom examples to ComponentExample format for display
  const customExamplesAsComponentExamples: ComponentExample[] = React.useMemo(
    () =>
      customExamples.map((ce) => ({
        title: ce.title,
        description: ce.description,
        schema: ce.schema,
      })),
    [customExamples]
  );

  const hasCustomExamples = customExamples.length > 0;
  const hasAnyExamples = hasSystemExamples || hasCustomExamples;
  const totalExamplesCount = (systemExamples?.length || 0) + customExamples.length;

  if (!hasAnyExamples && !showMigrationGuide && !showAddForm) {
    return (
      <div className={cn('p-4', className)}>
        <EmptyExamplesState componentName={component.name} />
        {/* Add custom example button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <PlusIcon />
            添加自定义案例
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-4 space-y-4', className)}>
      {/* Version Migration Guide - Requirements 10.5 */}
      {showMigrationGuide && (
        <MigrationGuideSection guide={migrationGuide} />
      )}

      {/* Add Custom Example Form */}
      {showAddForm && (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/30 dark:bg-purple-950/20">
          <CustomExampleForm
            componentName={component.name}
            onSubmit={handleAddExample}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Examples Section */}
      {(hasAnyExamples || !showAddForm) && (
        <>
          {/* Summary */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="text-sm flex items-center gap-4">
              <span>
                <span className="text-muted-foreground">共 </span>
                <span className="font-medium">{totalExamplesCount}</span>
                <span className="text-muted-foreground"> 个案例</span>
              </span>
              {hasSystemExamples && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <SystemIcon className="w-3 h-3" />
                  {systemExamples.length} 系统
                </span>
              )}
              {hasCustomExamples && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                  <UserIcon className="w-3 h-3" />
                  {customExamples.length} 用户
                </span>
              )}
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 transition-colors"
              >
                <PlusIcon />
                添加案例
              </button>
            )}
          </div>

          {/* System Examples List */}
          {hasSystemExamples && (
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <SystemIcon className="w-3.5 h-3.5 text-blue-500" />
                系统案例
              </h4>
              {systemExamples.map((example, index) => (
                <ExampleCard
                  key={`system-${example.title}-${index}`}
                  example={example}
                  index={index}
                  onOpenInEditor={onOpenInEditor}
                  isCustom={false}
                />
              ))}
            </div>
          )}

          {/* User Custom Examples List - Requirements 11.5 */}
          {hasCustomExamples && (
            <div className="space-y-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-purple-500" />
                用户自定义案例
              </h4>
              {customExamples.map((customExample, index) => (
                <ExampleCard
                  key={`custom-${customExample.id}`}
                  example={customExamplesAsComponentExamples[index]}
                  index={index}
                  onOpenInEditor={onOpenInEditor}
                  isCustom={true}
                  onDelete={() => handleDeleteExample(customExample.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty examples state when only migration guide is shown */}
      {!hasAnyExamples && showMigrationGuide && !showAddForm && (
        <>
          <EmptyExamplesState componentName={component.name} />
          <div className="flex justify-center">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <PlusIcon />
              添加自定义案例
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ExamplesTab;

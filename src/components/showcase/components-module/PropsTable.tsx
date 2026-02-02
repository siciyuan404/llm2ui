/**
 * @file PropsTable.tsx
 * @description Props 表格组件，用于展示组件的属性文档
 * @module components/showcase/components-module/PropsTable
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { PropSchema } from '@/lib';
import { ChevronIcon } from '@/components/ui/icons';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 格式化默认值显示
 */
function formatDefaultValue(value: unknown): string {
  if (value === undefined) return '-';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'function') return '[Function]';
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * 获取类型显示名称
 */
function getTypeDisplayName(type: PropSchema['type']): string {
  const typeNames: Record<PropSchema['type'], string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    function: 'function',
  };
  return typeNames[type] || type;
}

/**
 * 获取类型徽章颜色
 */
function getTypeBadgeClass(type: PropSchema['type']): string {
  const typeColors: Record<PropSchema['type'], string> = {
    string: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    number: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    boolean: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    object: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    array: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    function: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  };
  return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 类型徽章组件
 */
function TypeBadge({ type }: { type: PropSchema['type'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono rounded',
        getTypeBadgeClass(type)
      )}
    >
      {getTypeDisplayName(type)}
    </span>
  );
}

/**
 * 枚举值展示组件
 */
function EnumBadges({ values }: { values: string[] }) {
  if (!values || values.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {values.map((value, index) => (
        <code
          key={index}
          className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono"
        >
          "{value}"
        </code>
      ))}
    </div>
  );
}

/**
 * 复杂类型展开组件
 */
function ComplexTypeExpander({
  schema,
  isExpanded,
  onToggle,
}: {
  schema: PropSchema;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        <ChevronIcon className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-90')} />
        {isExpanded ? '收起类型定义' : '展开类型定义'}
      </button>
      {isExpanded && (
        <pre className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-auto">
          {JSON.stringify(schema, null, 2)}
        </pre>
      )}
    </div>
  );
}

/**
 * Props 表格行组件
 */
function PropRow({
  name,
  schema,
  expandedProps,
  onToggleExpand,
}: {
  name: string;
  schema: PropSchema;
  expandedProps: Set<string>;
  onToggleExpand: (name: string) => void;
}) {
  const isComplex = schema.type === 'object' || schema.type === 'array';
  const isExpanded = expandedProps.has(name);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-3 px-4">
        <code className="text-sm font-semibold font-mono">{name}</code>
        {schema.required && (
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded">
            必填
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {schema.description || '-'}
      </td>
      <td className="py-3 px-4">
        <TypeBadge type={schema.type} />
        {schema.enum && <EnumBadges values={schema.enum} />}
        {isComplex && (
          <ComplexTypeExpander
            schema={schema}
            isExpanded={isExpanded}
            onToggle={() => onToggleExpand(name)}
          />
        )}
      </td>
      <td className="py-3 px-4">
        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
          {formatDefaultValue(schema.default)}
        </code>
      </td>
    </tr>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export interface PropsTableProps {
  /** Props schema 定义 */
  propsSchema: Record<string, PropSchema>;
}

/**
 * Props 表格组件
 * 展示组件的属性文档，支持枚举徽章和复杂类型展开
 */
export const PropsTable = React.memo(function PropsTable({ propsSchema }: PropsTableProps) {
  const [expandedProps, setExpandedProps] = React.useState<Set<string>>(new Set());

  const toggleExpand = (name: string) => {
    setExpandedProps(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // 排序：必填优先，然后按字母排序
  const sortedProps = React.useMemo(() => {
    return Object.entries(propsSchema).sort((a, b) => {
      const aRequired = a[1].required ?? false;
      const bRequired = b[1].required ?? false;
      if (aRequired !== bRequired) {
        return bRequired ? 1 : -1;
      }
      return a[0].localeCompare(b[0]);
    });
  }, [propsSchema]);

  if (sortedProps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">此组件暂无属性文档</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="py-2 px-4 text-sm font-medium">Name</th>
            <th className="py-2 px-4 text-sm font-medium">Description</th>
            <th className="py-2 px-4 text-sm font-medium">Type/Options</th>
            <th className="py-2 px-4 text-sm font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {sortedProps.map(([name, schema]) => (
            <PropRow
              key={name}
              name={name}
              schema={schema}
              expandedProps={expandedProps}
              onToggleExpand={toggleExpand}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PropsTable;

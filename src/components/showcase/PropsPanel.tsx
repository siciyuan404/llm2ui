/**
 * PropsPanel - Component properties documentation panel
 * 
 * Displays all configurable properties of a component including:
 * - Property name and type
 * - Required/optional status
 * - Default values
 * - Enum values for string types
 * - Property descriptions
 * - Version selector for multi-version components
 * 
 * @module PropsPanel
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 10.3
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentDefinition, PropSchema, ComponentRegistry } from '@/lib';
import { defaultRegistry } from '@/lib';
import { VersionSelector } from './VersionSelector';
import { UpgradeAlert } from './UpgradeAlert';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for PropsPanel component
 */
export interface PropsPanelProps {
  /** Component definition to display props for */
  component: ComponentDefinition;
  /** Additional class name */
  className?: string;
  /** Component registry for version lookup */
  registry?: ComponentRegistry;
  /** Callback when version is changed */
  onVersionChange?: (version: string) => void;
}

/**
 * Props for PropRow component (internal)
 */
interface PropRowProps {
  /** Property name */
  name: string;
  /** Property schema */
  schema: PropSchema;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display name for property type
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
 * Get type badge color class
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

/**
 * Format default value for display
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

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Type badge component
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
 * Required badge component
 */
function RequiredBadge({ required }: { required: boolean }) {
  if (!required) return null;
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded">
      必填
    </span>
  );
}

/**
 * Enum values display component
 */
function EnumValues({ values }: { values: string[] }) {
  if (!values || values.length === 0) return null;
  
  return (
    <div className="mt-2">
      <span className="text-xs text-muted-foreground">可选值: </span>
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
    </div>
  );
}

/**
 * Single property row component
 */
function PropRow({ name, schema }: PropRowProps) {
  return (
    <div className="py-3 border-b border-border last:border-b-0">
      {/* Property header */}
      <div className="flex items-center gap-2 flex-wrap">
        <code className="text-sm font-semibold font-mono text-foreground">
          {name}
        </code>
        <TypeBadge type={schema.type} />
        <RequiredBadge required={schema.required ?? false} />
      </div>

      {/* Description */}
      {schema.description && (
        <p className="mt-1.5 text-sm text-muted-foreground">
          {schema.description}
        </p>
      )}

      {/* Default value */}
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">默认值:</span>
        <code className="px-1.5 py-0.5 bg-muted rounded font-mono">
          {formatDefaultValue(schema.default)}
        </code>
      </div>

      {/* Enum values */}
      {schema.enum && <EnumValues values={schema.enum} />}
    </div>
  );
}

/**
 * Empty state when no props are defined
 */
function EmptyPropsState() {
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="text-sm text-muted-foreground">
        此组件暂无属性文档
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        组件可能不需要配置属性，或属性文档尚未添加
      </p>
    </div>
  );
}

/**
 * Props summary header
 */
function PropsSummary({
  totalProps,
  requiredProps,
  component,
  registry,
  onVersionChange,
}: {
  totalProps: number;
  requiredProps: number;
  component: ComponentDefinition;
  registry?: ComponentRegistry;
  onVersionChange?: (version: string) => void;
}) {
  // Get available versions
  const versions = React.useMemo(() => {
    return (registry || defaultRegistry).getVersions(component.name);
  }, [registry, component.name]);

  const hasMultipleVersions = versions.length > 1;

  return (
    <div className="pb-3 mb-3 border-b border-border">
      {/* Upgrade Alert */}
      <UpgradeAlert
        component={component}
        registry={registry}
        onUpgrade={onVersionChange}
        compact={true}
        className="mb-3"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">共 </span>
            <span className="font-medium">{totalProps}</span>
            <span className="text-muted-foreground"> 个属性</span>
          </div>
          {requiredProps > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">其中 </span>
              <span className="font-medium text-red-600 dark:text-red-400">{requiredProps}</span>
              <span className="text-muted-foreground"> 个必填</span>
            </div>
          )}
        </div>
        
        {/* Version Selector */}
        {(hasMultipleVersions || component.version) && (
          <VersionSelector
            componentName={component.name}
            currentVersion={component.version}
            onVersionChange={onVersionChange}
            registry={registry}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * PropsPanel - Displays component properties documentation
 * 
 * Features:
 * - Shows all configurable properties
 * - Displays property type with color-coded badges
 * - Shows required/optional status
 * - Displays default values
 * - Lists enum values for string types
 * - Shows property descriptions
 * - Empty state for components without props
 * - Version selector for multi-version components
 * 
 * @see Requirements 3.1, 3.2, 3.3, 3.4, 10.3
 */
export function PropsPanel({ component, className, registry, onVersionChange }: PropsPanelProps) {
  const propsSchema = component.propsSchema;
  
  // Check if component has props
  const hasProps = propsSchema && Object.keys(propsSchema).length > 0;
  
  // Calculate stats
  const propEntries = hasProps ? Object.entries(propsSchema) : [];
  const totalProps = propEntries.length;
  const requiredProps = propEntries.filter(([, schema]) => schema.required).length;

  // Sort props: required first, then alphabetically
  const sortedProps = React.useMemo(() => {
    return [...propEntries].sort((a, b) => {
      // Required props first
      const aRequired = a[1].required ?? false;
      const bRequired = b[1].required ?? false;
      if (aRequired !== bRequired) {
        return bRequired ? 1 : -1;
      }
      // Then alphabetically
      return a[0].localeCompare(b[0]);
    });
  }, [propEntries]);

  if (!hasProps) {
    return (
      <div className={cn('p-4', className)}>
        <EmptyPropsState />
      </div>
    );
  }

  return (
    <div className={cn('p-4', className)}>
      {/* Summary with Version Selector */}
      <PropsSummary
        totalProps={totalProps}
        requiredProps={requiredProps}
        component={component}
        registry={registry}
        onVersionChange={onVersionChange}
      />

      {/* Props list */}
      <div className="space-y-0">
        {sortedProps.map(([name, schema]) => (
          <PropRow key={name} name={name} schema={schema} />
        ))}
      </div>
    </div>
  );
}

export default PropsPanel;

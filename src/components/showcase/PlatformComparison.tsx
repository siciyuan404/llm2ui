/**
 * PlatformComparison - Platform comparison component for component showcase
 * 
 * Displays the same component side-by-side across different platforms,
 * showing property support differences and style differences.
 * 
 * @module PlatformComparison
 * @see Requirements 7.3
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ComponentDefinition, PlatformType } from '@/lib';
import { defaultRegistry, createPlatformAdapter } from '@/lib';
import { LivePreview, type PreviewTheme } from './LivePreview';

// ============================================================================
// Types
// ============================================================================

/**
 * Platform info for display
 */
export interface PlatformInfo {
  /** Platform type */
  value: PlatformType;
  /** Display label */
  label: string;
  /** Short label for compact display */
  shortLabel: string;
  /** Platform icon */
  icon: React.ReactNode;
}

/**
 * Property difference between platforms
 */
export interface PropertyDifference {
  /** Property name */
  name: string;
  /** Source platform value/mapping */
  source: string;
  /** Target platform value/mapping */
  target: string;
  /** Difference type */
  type: 'renamed' | 'unsupported' | 'added';
}

/**
 * Platform comparison result
 */
export interface PlatformComparisonResult {
  /** Source platform */
  sourcePlatform: PlatformType;
  /** Target platform */
  targetPlatform: PlatformType;
  /** Property differences */
  propDifferences: PropertyDifference[];
  /** Style differences */
  styleDifferences: PropertyDifference[];
  /** Event differences */
  eventDifferences: PropertyDifference[];
  /** Whether component is supported on target platform */
  isSupported: boolean;
}

/**
 * Property support status for a platform
 */
export interface PropertySupportStatus {
  /** Property name */
  name: string;
  /** Property type */
  type?: string;
  /** Whether property is supported */
  supported: boolean;
  /** Mapped name on this platform (if different) */
  mappedName?: string;
  /** Description */
  description?: string;
}

/**
 * Platform property support comparison
 */
export interface PlatformPropertySupport {
  /** Platform type */
  platform: PlatformType;
  /** Property support statuses */
  properties: PropertySupportStatus[];
  /** Style support statuses */
  styles: PropertySupportStatus[];
  /** Event support statuses */
  events: PropertySupportStatus[];
}

/**
 * Multi-platform comparison result
 */
export interface MultiPlatformComparisonResult {
  /** Component name */
  componentName: string;
  /** All platforms being compared */
  platforms: PlatformType[];
  /** Property support by platform */
  propertySupport: Map<PlatformType, PlatformPropertySupport>;
  /** Properties with differences across platforms */
  differingProperties: string[];
  /** Styles with differences across platforms */
  differingStyles: string[];
  /** Events with differences across platforms */
  differingEvents: string[];
}

/**
 * Props for PlatformComparison
 */
export interface PlatformComparisonProps {
  /** Component definition to compare */
  component: ComponentDefinition;
  /** Platforms to compare (defaults to all supported platforms) */
  platforms?: PlatformType[];
  /** Preview theme */
  theme?: PreviewTheme;
  /** Whether to show difference details */
  showDifferences?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Props for PlatformPreviewCard
 */
interface PlatformPreviewCardProps {
  /** Component definition */
  component: ComponentDefinition;
  /** Platform type */
  platform: PlatformType;
  /** Platform info */
  platformInfo: PlatformInfo;
  /** Whether component is supported */
  isSupported: boolean;
  /** Preview theme */
  theme: PreviewTheme;
  /** Whether this card is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props for DifferencePanel
 */
interface DifferencePanelProps {
  /** Comparison result */
  comparison: PlatformComparisonResult;
  /** Source platform info */
  sourcePlatformInfo: PlatformInfo;
  /** Target platform info */
  targetPlatformInfo: PlatformInfo;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Platform information for display
 */
export const PLATFORM_INFO: Record<PlatformType, PlatformInfo> = {
  'pc-web': {
    value: 'pc-web',
    label: 'PC Web',
    shortLabel: 'PC',
    icon: <DesktopIcon />,
  },
  'mobile-web': {
    value: 'mobile-web',
    label: 'Mobile Web',
    shortLabel: 'M-Web',
    icon: <TabletIcon />,
  },
  'mobile-native': {
    value: 'mobile-native',
    label: 'Mobile Native',
    shortLabel: 'Native',
    icon: <MobileIcon />,
  },
  'pc-desktop': {
    value: 'pc-desktop',
    label: 'PC Desktop',
    shortLabel: 'Desktop',
    icon: <DesktopAppIcon />,
  },
};

/**
 * All platform types in display order
 */
export const ALL_PLATFORMS: PlatformType[] = [
  'pc-web',
  'mobile-web',
  'mobile-native',
  'pc-desktop',
];

// ============================================================================
// Icons
// ============================================================================

function DesktopIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function DesktopAppIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h2M7 10h4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get platforms supported by a component
 */
function getSupportedPlatforms(component: ComponentDefinition): PlatformType[] {
  if (!component.platforms || component.platforms.length === 0) {
    return ALL_PLATFORMS;
  }
  return component.platforms;
}

/**
 * Compare mappings between two platforms
 */
function compareMappings(
  sourceMapping: Record<string, string>,
  targetMapping: Record<string, string>
): PropertyDifference[] {
  const differences: PropertyDifference[] = [];
  const allKeys = new Set([...Object.keys(sourceMapping), ...Object.keys(targetMapping)]);

  for (const key of allKeys) {
    const sourceValue = sourceMapping[key];
    const targetValue = targetMapping[key];

    if (sourceValue && targetValue) {
      // Both have the property
      if (sourceValue !== targetValue) {
        differences.push({
          name: key,
          source: sourceValue,
          target: targetValue,
          type: 'renamed',
        });
      }
    } else if (sourceValue && !targetValue) {
      // Source has it, target doesn't
      differences.push({
        name: key,
        source: sourceValue,
        target: '-',
        type: 'unsupported',
      });
    } else if (!sourceValue && targetValue) {
      // Target has it, source doesn't
      differences.push({
        name: key,
        source: '-',
        target: targetValue,
        type: 'added',
      });
    }
  }

  return differences;
}

/**
 * Compare a component across two platforms
 */
function comparePlatforms(
  component: ComponentDefinition,
  sourcePlatform: PlatformType,
  targetPlatform: PlatformType
): PlatformComparisonResult {
  const adapter = createPlatformAdapter(defaultRegistry);
  
  const sourceMapping = adapter.getMapping(component.name, sourcePlatform, sourcePlatform);
  const targetMapping = adapter.getMapping(component.name, sourcePlatform, targetPlatform);
  
  const isSupported = adapter.isSupported(component.name, targetPlatform);

  return {
    sourcePlatform,
    targetPlatform,
    propDifferences: compareMappings(sourceMapping.props, targetMapping.props),
    styleDifferences: compareMappings(sourceMapping.styles, targetMapping.styles),
    eventDifferences: compareMappings(sourceMapping.events, targetMapping.events),
    isSupported,
  };
}

/**
 * Get property support status for a platform
 */
function getPropertySupportForPlatform(
  component: ComponentDefinition,
  platform: PlatformType,
  basePlatform: PlatformType = 'pc-web'
): PlatformPropertySupport {
  const adapter = createPlatformAdapter(defaultRegistry);
  const mapping = adapter.getMapping(component.name, basePlatform, platform);
  const isSupported = adapter.isSupported(component.name, platform);

  // Get component props from schema
  const propsSchema = component.propsSchema || {};
  const properties: PropertySupportStatus[] = Object.entries(propsSchema).map(([name, schema]) => {
    const mappedName = mapping.props[name];
    return {
      name,
      type: schema.type,
      supported: isSupported && !!mappedName,
      mappedName: mappedName !== name ? mappedName : undefined,
      description: schema.description,
    };
  });

  // Get common style properties
  const commonStyles = [
    'width', 'height', 'padding', 'margin', 'backgroundColor', 'color',
    'fontSize', 'fontWeight', 'borderRadius', 'border', 'display',
    'flexDirection', 'justifyContent', 'alignItems', 'gap', 'opacity',
  ];
  const styles: PropertySupportStatus[] = commonStyles.map(name => {
    const mappedName = mapping.styles[name];
    return {
      name,
      supported: isSupported && !!mappedName,
      mappedName: mappedName !== name ? mappedName : undefined,
    };
  });

  // Get common events
  const commonEvents = [
    'onClick', 'onChange', 'onFocus', 'onBlur', 'onSubmit',
    'onMouseEnter', 'onMouseLeave', 'onKeyDown', 'onKeyUp',
  ];
  const events: PropertySupportStatus[] = commonEvents.map(name => {
    const mappedName = mapping.events[name];
    return {
      name,
      supported: isSupported && !!mappedName,
      mappedName: mappedName !== name ? mappedName : undefined,
    };
  });

  return {
    platform,
    properties,
    styles,
    events,
  };
}

/**
 * Compare a component across multiple platforms
 */
export function compareMultiplePlatforms(
  component: ComponentDefinition,
  platforms: PlatformType[]
): MultiPlatformComparisonResult {
  const propertySupport = new Map<PlatformType, PlatformPropertySupport>();
  
  // Get support status for each platform
  for (const platform of platforms) {
    propertySupport.set(platform, getPropertySupportForPlatform(component, platform));
  }

  // Find properties with differences
  const differingProperties: string[] = [];
  const differingStyles: string[] = [];
  const differingEvents: string[] = [];

  // Check properties
  const firstPlatformProps = propertySupport.get(platforms[0])?.properties || [];
  for (const prop of firstPlatformProps) {
    let hasDifference = false;
    for (let i = 1; i < platforms.length; i++) {
      const otherPlatformProps = propertySupport.get(platforms[i])?.properties || [];
      const otherProp = otherPlatformProps.find(p => p.name === prop.name);
      if (!otherProp || otherProp.supported !== prop.supported || otherProp.mappedName !== prop.mappedName) {
        hasDifference = true;
        break;
      }
    }
    if (hasDifference) {
      differingProperties.push(prop.name);
    }
  }

  // Check styles
  const firstPlatformStyles = propertySupport.get(platforms[0])?.styles || [];
  for (const style of firstPlatformStyles) {
    let hasDifference = false;
    for (let i = 1; i < platforms.length; i++) {
      const otherPlatformStyles = propertySupport.get(platforms[i])?.styles || [];
      const otherStyle = otherPlatformStyles.find(s => s.name === style.name);
      if (!otherStyle || otherStyle.supported !== style.supported || otherStyle.mappedName !== style.mappedName) {
        hasDifference = true;
        break;
      }
    }
    if (hasDifference) {
      differingStyles.push(style.name);
    }
  }

  // Check events
  const firstPlatformEvents = propertySupport.get(platforms[0])?.events || [];
  for (const event of firstPlatformEvents) {
    let hasDifference = false;
    for (let i = 1; i < platforms.length; i++) {
      const otherPlatformEvents = propertySupport.get(platforms[i])?.events || [];
      const otherEvent = otherPlatformEvents.find(e => e.name === event.name);
      if (!otherEvent || otherEvent.supported !== event.supported || otherEvent.mappedName !== event.mappedName) {
        hasDifference = true;
        break;
      }
    }
    if (hasDifference) {
      differingEvents.push(event.name);
    }
  }

  return {
    componentName: component.name,
    platforms,
    propertySupport,
    differingProperties,
    differingStyles,
    differingEvents,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Platform preview card
 */
function PlatformPreviewCard({
  component,
  // platform is used for key identification in parent, not needed in this component
  platform: _platform,
  platformInfo,
  isSupported,
  theme,
  isSelected,
  onClick,
}: PlatformPreviewCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col border rounded-lg overflow-hidden transition-all',
        isSelected && 'ring-2 ring-primary',
        !isSupported && 'opacity-60',
        onClick && 'cursor-pointer hover:border-primary/50'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Platform Header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2 border-b',
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-muted/50'
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-muted-foreground',
            theme === 'dark' && 'text-slate-400'
          )}>
            {platformInfo.icon}
          </span>
          <span className={cn(
            'text-sm font-medium',
            theme === 'dark' ? 'text-slate-200' : 'text-foreground'
          )}>
            {platformInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isSupported ? (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckIcon />
              <span>支持</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <XIcon />
              <span>不支持</span>
            </span>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className={cn(
        'flex-1 p-4 min-h-[120px]',
        theme === 'dark' ? 'bg-slate-900' : 'bg-background'
      )}>
        {isSupported ? (
          <LivePreview
            component={component}
            theme={theme}
            previewSize="desktop"
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <XIcon />
              <p className="text-xs mt-1">此平台不支持该组件</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Difference table for a category
 */
function DifferenceTable({
  title,
  differences,
  emptyMessage,
}: {
  title: string;
  differences: PropertyDifference[];
  emptyMessage: string;
}) {
  // Filter to only show actual differences (renamed or unsupported)
  const significantDifferences = differences.filter(
    d => d.type === 'renamed' || d.type === 'unsupported'
  );

  if (significantDifferences.length === 0) {
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">
        {title}
        <span className="ml-2 text-xs text-muted-foreground">
          ({significantDifferences.length} 项差异)
        </span>
      </h4>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1.5 text-left font-medium">属性</th>
              <th className="px-2 py-1.5 text-left font-medium">源平台</th>
              <th className="px-2 py-1.5 text-center font-medium w-8"></th>
              <th className="px-2 py-1.5 text-left font-medium">目标平台</th>
              <th className="px-2 py-1.5 text-left font-medium">类型</th>
            </tr>
          </thead>
          <tbody>
            {significantDifferences.map((diff, index) => (
              <tr
                key={diff.name}
                className={cn(
                  'border-t',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                )}
              >
                <td className="px-2 py-1.5 font-mono">{diff.name}</td>
                <td className="px-2 py-1.5 font-mono text-muted-foreground">
                  {diff.source}
                </td>
                <td className="px-2 py-1.5 text-center text-muted-foreground">
                  <ArrowRightIcon />
                </td>
                <td className={cn(
                  'px-2 py-1.5 font-mono',
                  diff.type === 'renamed' && 'text-amber-600 dark:text-amber-400',
                  diff.type === 'unsupported' && 'text-red-500 dark:text-red-400'
                )}>
                  {diff.target}
                </td>
                <td className="px-2 py-1.5">
                  <span className={cn(
                    'inline-block px-1.5 py-0.5 rounded text-xs',
                    diff.type === 'renamed' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    diff.type === 'unsupported' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}>
                    {diff.type === 'renamed' ? '重命名' : '不支持'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Difference panel showing detailed comparison
 */
function DifferencePanel({
  comparison,
  sourcePlatformInfo,
  targetPlatformInfo,
}: DifferencePanelProps) {
  const totalDifferences = 
    comparison.propDifferences.filter(d => d.type !== 'added').length +
    comparison.styleDifferences.filter(d => d.type !== 'added').length +
    comparison.eventDifferences.filter(d => d.type !== 'added').length;

  return (
    <div className="border rounded-lg p-4 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm">
            {sourcePlatformInfo.icon}
            <span className="font-medium">{sourcePlatformInfo.label}</span>
          </span>
          <ArrowRightIcon />
          <span className="flex items-center gap-1 text-sm">
            {targetPlatformInfo.icon}
            <span className="font-medium">{targetPlatformInfo.label}</span>
          </span>
        </div>
        <span className={cn(
          'text-xs px-2 py-1 rounded',
          totalDifferences === 0 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        )}>
          {totalDifferences === 0 ? '完全兼容' : `${totalDifferences} 项差异`}
        </span>
      </div>

      {/* Difference Tables */}
      <DifferenceTable
        title="属性差异"
        differences={comparison.propDifferences}
        emptyMessage="属性完全兼容"
      />
      <DifferenceTable
        title="样式差异"
        differences={comparison.styleDifferences}
        emptyMessage="样式完全兼容"
      />
      <DifferenceTable
        title="事件差异"
        differences={comparison.eventDifferences}
        emptyMessage="事件完全兼容"
      />
    </div>
  );
}

/**
 * Support status cell for multi-platform comparison table
 */
function SupportStatusCell({
  status,
  showMappedName = true,
}: {
  status: PropertySupportStatus;
  showMappedName?: boolean;
}) {
  if (!status.supported) {
    return (
      <td className="px-2 py-1.5 text-center">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <XIcon />
        </span>
      </td>
    );
  }

  return (
    <td className="px-2 py-1.5 text-center">
      <div className="flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <CheckIcon />
        </span>
        {showMappedName && status.mappedName && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono truncate max-w-[80px]" title={status.mappedName}>
            → {status.mappedName}
          </span>
        )}
      </div>
    </td>
  );
}

/**
 * Multi-platform comparison table
 * Shows property/style/event support across all platforms at once
 */
function MultiPlatformComparisonTable({
  comparison,
  category,
  title,
  showOnlyDifferences = false,
}: {
  comparison: MultiPlatformComparisonResult;
  category: 'properties' | 'styles' | 'events';
  title: string;
  showOnlyDifferences?: boolean;
}) {
  const { platforms, propertySupport, differingProperties, differingStyles, differingEvents } = comparison;
  
  // Get the items to display based on category
  const firstPlatformSupport = propertySupport.get(platforms[0]);
  if (!firstPlatformSupport) return null;

  let items: PropertySupportStatus[];
  let differingItems: string[];
  
  switch (category) {
    case 'properties':
      items = firstPlatformSupport.properties;
      differingItems = differingProperties;
      break;
    case 'styles':
      items = firstPlatformSupport.styles;
      differingItems = differingStyles;
      break;
    case 'events':
      items = firstPlatformSupport.events;
      differingItems = differingEvents;
      break;
  }

  // Filter to only show items with differences if requested
  const displayItems = showOnlyDifferences
    ? items.filter(item => differingItems.includes(item.name))
    : items;

  if (displayItems.length === 0) {
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground">
          {showOnlyDifferences ? '无差异项' : '无可比较项'}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">
        {title}
        {differingItems.length > 0 && (
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {differingItems.length} 项差异
          </span>
        )}
      </h4>
      <div className="border rounded-md overflow-hidden overflow-x-auto">
        <table className="w-full text-xs min-w-[500px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1.5 text-left font-medium sticky left-0 bg-muted/50 min-w-[120px]">
                {category === 'properties' ? '属性' : category === 'styles' ? '样式' : '事件'}
              </th>
              {platforms.map(platform => (
                <th key={platform} className="px-2 py-1.5 text-center font-medium min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    {PLATFORM_INFO[platform].icon}
                    <span>{PLATFORM_INFO[platform].shortLabel}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, index) => {
              const hasDifference = differingItems.includes(item.name);
              return (
                <tr
                  key={item.name}
                  className={cn(
                    'border-t',
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                    hasDifference && 'bg-amber-50 dark:bg-amber-900/10'
                  )}
                >
                  <td className={cn(
                    'px-2 py-1.5 font-mono sticky left-0',
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                    hasDifference && 'bg-amber-50 dark:bg-amber-900/10'
                  )}>
                    <div className="flex items-center gap-1">
                      {hasDifference && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      )}
                      <span className={cn(hasDifference && 'text-amber-700 dark:text-amber-400')}>
                        {item.name}
                      </span>
                    </div>
                    {item.type && (
                      <span className="text-[10px] text-muted-foreground ml-2">
                        ({item.type})
                      </span>
                    )}
                  </td>
                  {platforms.map(platform => {
                    const platformSupport = propertySupport.get(platform);
                    const platformItems = platformSupport?.[category] || [];
                    const platformItem = platformItems.find(p => p.name === item.name);
                    
                    if (!platformItem) {
                      return (
                        <td key={platform} className="px-2 py-1.5 text-center text-muted-foreground">
                          -
                        </td>
                      );
                    }
                    
                    return (
                      <SupportStatusCell
                        key={platform}
                        status={platformItem}
                        showMappedName={hasDifference}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Full multi-platform comparison panel
 * Shows all property/style/event differences across platforms
 */
export function MultiPlatformDifferencePanel({
  component,
  platforms,
  showOnlyDifferences = false,
}: {
  component: ComponentDefinition;
  platforms: PlatformType[];
  showOnlyDifferences?: boolean;
}) {
  const comparison = React.useMemo(
    () => compareMultiplePlatforms(component, platforms),
    [component, platforms]
  );

  const totalDifferences = 
    comparison.differingProperties.length +
    comparison.differingStyles.length +
    comparison.differingEvents.length;

  return (
    <div className="border rounded-lg p-4 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">跨平台差异对比</h3>
          <span className="text-xs text-muted-foreground">
            ({platforms.length} 个平台)
          </span>
        </div>
        <span className={cn(
          'text-xs px-2 py-1 rounded',
          totalDifferences === 0 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        )}>
          {totalDifferences === 0 ? '完全兼容' : `${totalDifferences} 项差异`}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckIcon />
          </span>
          <span>支持</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <XIcon />
          </span>
          <span>不支持</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>有差异</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-600 dark:text-amber-400 font-mono">→ name</span>
          <span>属性重命名</span>
        </div>
      </div>

      {/* Comparison Tables */}
      {component.propsSchema && Object.keys(component.propsSchema).length > 0 && (
        <MultiPlatformComparisonTable
          comparison={comparison}
          category="properties"
          title="属性支持对比"
          showOnlyDifferences={showOnlyDifferences}
        />
      )}
      
      <MultiPlatformComparisonTable
        comparison={comparison}
        category="styles"
        title="样式支持对比"
        showOnlyDifferences={showOnlyDifferences}
      />
      
      <MultiPlatformComparisonTable
        comparison={comparison}
        category="events"
        title="事件支持对比"
        showOnlyDifferences={showOnlyDifferences}
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * View mode for platform comparison
 */
type ComparisonViewMode = 'preview' | 'table';

/**
 * View mode toggle button
 */
function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ComparisonViewMode;
  onChange: (mode: ComparisonViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <button
        type="button"
        className={cn(
          'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
          mode === 'preview'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onChange('preview')}
      >
        预览对比
      </button>
      <button
        type="button"
        className={cn(
          'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
          mode === 'table'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onChange('table')}
      >
        差异表格
      </button>
    </div>
  );
}

/**
 * Filter toggle for showing only differences
 */
function DifferenceFilterToggle({
  showOnlyDifferences,
  onChange,
}: {
  showOnlyDifferences: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <input
        type="checkbox"
        checked={showOnlyDifferences}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary"
      />
      <span className="text-muted-foreground">仅显示差异项</span>
    </label>
  );
}

/**
 * PlatformComparison - Compare component across platforms
 * 
 * Features:
 * - Side-by-side preview of component on different platforms
 * - Support status indicator for each platform
 * - Detailed property/style/event difference comparison
 * - Highlight differences with color coding
 * - Interactive platform selection for detailed comparison
 * - Multi-platform comparison table view
 * - Filter to show only differences
 * 
 * @see Requirements 7.3
 */
export function PlatformComparison({
  component,
  platforms,
  theme = 'light',
  showDifferences = true,
  className,
}: PlatformComparisonProps) {
  // Determine which platforms to show
  const supportedPlatforms = getSupportedPlatforms(component);
  const displayPlatforms = platforms || ALL_PLATFORMS;
  
  // State for view mode
  const [viewMode, setViewMode] = React.useState<ComparisonViewMode>('preview');
  
  // State for showing only differences in table view
  const [showOnlyDifferences, setShowOnlyDifferences] = React.useState(false);
  
  // State for selected comparison (preview mode)
  const [selectedPlatform, setSelectedPlatform] = React.useState<PlatformType | null>(null);
  const basePlatform: PlatformType = 'pc-web';

  // Calculate comparison when a platform is selected
  const comparison = React.useMemo(() => {
    if (!selectedPlatform || selectedPlatform === basePlatform) return null;
    return comparePlatforms(component, basePlatform, selectedPlatform);
  }, [component, selectedPlatform]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with view mode toggle */}
      {showDifferences && (
        <div className="flex items-center justify-between">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          {viewMode === 'table' && (
            <DifferenceFilterToggle
              showOnlyDifferences={showOnlyDifferences}
              onChange={setShowOnlyDifferences}
            />
          )}
        </div>
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && (
        <>
          {/* Platform Preview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPlatforms.map((platform) => {
              const platformInfo = PLATFORM_INFO[platform];
              const isSupported = supportedPlatforms.includes(platform);
              
              return (
                <PlatformPreviewCard
                  key={platform}
                  component={component}
                  platform={platform}
                  platformInfo={platformInfo}
                  isSupported={isSupported}
                  theme={theme}
                  isSelected={selectedPlatform === platform}
                  onClick={showDifferences && platform !== basePlatform ? () => {
                    setSelectedPlatform(prev => prev === platform ? null : platform);
                  } : undefined}
                />
              );
            })}
          </div>

          {/* Hint for selecting platform */}
          {showDifferences && !selectedPlatform && (
            <p className="text-xs text-muted-foreground text-center">
              点击非 PC Web 平台卡片查看详细差异对比
            </p>
          )}

          {/* Difference Panel */}
          {showDifferences && comparison && selectedPlatform && (
            <DifferencePanel
              comparison={comparison}
              sourcePlatformInfo={PLATFORM_INFO[basePlatform]}
              targetPlatformInfo={PLATFORM_INFO[selectedPlatform]}
            />
          )}
        </>
      )}

      {/* Table Mode - Multi-platform comparison */}
      {viewMode === 'table' && showDifferences && (
        <MultiPlatformDifferencePanel
          component={component}
          platforms={displayPlatforms}
          showOnlyDifferences={showOnlyDifferences}
        />
      )}
    </div>
  );
}

export default PlatformComparison;

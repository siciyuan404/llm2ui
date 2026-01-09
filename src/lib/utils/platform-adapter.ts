/**
 * Platform Adapter
 * 
 * Handles cross-platform component adaptation.
 * Maps props, styles, and events between different platforms.
 * 
 * @module lib/utils/platform-adapter
 * @see Requirements 7.2, 7.4, 7.5
 */

import type { UISchema, UIComponent, StyleProps } from '../../types';
import type { PlatformType, ComponentRegistry } from '../core/component-registry';

/**
 * Platform mapping configuration
 */
export interface PlatformMapping {
  /** Property name mappings */
  props: Record<string, string>;
  /** Style name mappings */
  styles: Record<string, string>;
  /** Event name mappings */
  events: Record<string, string>;
}


/**
 * Default platform mappings
 * Maps from pc-web (source) to other platforms
 * 
 * Each platform has comprehensive mappings for:
 * - props: Component property name mappings
 * - styles: CSS/style property name mappings
 * - events: Event handler name mappings
 */
const defaultMappings: Record<PlatformType, PlatformMapping> = {
  /**
   * PC Web Platform (Source/Reference)
   * Standard web platform using React/HTML conventions
   */
  'pc-web': {
    props: {
      // Standard HTML/React props (identity mappings)
      className: 'className',
      id: 'id',
      disabled: 'disabled',
      placeholder: 'placeholder',
      value: 'value',
      defaultValue: 'defaultValue',
      checked: 'checked',
      selected: 'selected',
      readOnly: 'readOnly',
      required: 'required',
      autoFocus: 'autoFocus',
      autoComplete: 'autoComplete',
      name: 'name',
      type: 'type',
      href: 'href',
      target: 'target',
      src: 'src',
      alt: 'alt',
      title: 'title',
      role: 'role',
      tabIndex: 'tabIndex',
      'aria-label': 'aria-label',
      'aria-describedby': 'aria-describedby',
      'aria-hidden': 'aria-hidden',
      'data-testid': 'data-testid',
    },
    styles: {
      // Standard CSS properties (identity mappings)
      width: 'width',
      height: 'height',
      minWidth: 'minWidth',
      maxWidth: 'maxWidth',
      minHeight: 'minHeight',
      maxHeight: 'maxHeight',
      padding: 'padding',
      paddingTop: 'paddingTop',
      paddingRight: 'paddingRight',
      paddingBottom: 'paddingBottom',
      paddingLeft: 'paddingLeft',
      margin: 'margin',
      marginTop: 'marginTop',
      marginRight: 'marginRight',
      marginBottom: 'marginBottom',
      marginLeft: 'marginLeft',
      display: 'display',
      flexDirection: 'flexDirection',
      justifyContent: 'justifyContent',
      alignItems: 'alignItems',
      alignSelf: 'alignSelf',
      flexWrap: 'flexWrap',
      flexGrow: 'flexGrow',
      flexShrink: 'flexShrink',
      gap: 'gap',
      rowGap: 'rowGap',
      columnGap: 'columnGap',
      position: 'position',
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left',
      zIndex: 'zIndex',
      overflow: 'overflow',
      overflowX: 'overflowX',
      overflowY: 'overflowY',
      backgroundColor: 'backgroundColor',
      color: 'color',
      fontSize: 'fontSize',
      fontWeight: 'fontWeight',
      fontFamily: 'fontFamily',
      fontStyle: 'fontStyle',
      lineHeight: 'lineHeight',
      textAlign: 'textAlign',
      textDecoration: 'textDecoration',
      textTransform: 'textTransform',
      letterSpacing: 'letterSpacing',
      border: 'border',
      borderWidth: 'borderWidth',
      borderStyle: 'borderStyle',
      borderColor: 'borderColor',
      borderRadius: 'borderRadius',
      borderTop: 'borderTop',
      borderRight: 'borderRight',
      borderBottom: 'borderBottom',
      borderLeft: 'borderLeft',
      boxShadow: 'boxShadow',
      opacity: 'opacity',
      cursor: 'cursor',
      visibility: 'visibility',
      transform: 'transform',
      transition: 'transition',
    },
    events: {
      // Standard DOM events (identity mappings)
      onClick: 'onClick',
      onDoubleClick: 'onDoubleClick',
      onChange: 'onChange',
      onInput: 'onInput',
      onSubmit: 'onSubmit',
      onFocus: 'onFocus',
      onBlur: 'onBlur',
      onKeyDown: 'onKeyDown',
      onKeyUp: 'onKeyUp',
      onKeyPress: 'onKeyPress',
      onMouseEnter: 'onMouseEnter',
      onMouseLeave: 'onMouseLeave',
      onMouseDown: 'onMouseDown',
      onMouseUp: 'onMouseUp',
      onMouseMove: 'onMouseMove',
      onScroll: 'onScroll',
      onWheel: 'onWheel',
      onDragStart: 'onDragStart',
      onDrag: 'onDrag',
      onDragEnd: 'onDragEnd',
      onDrop: 'onDrop',
      onDragOver: 'onDragOver',
      onContextMenu: 'onContextMenu',
      onCopy: 'onCopy',
      onPaste: 'onPaste',
      onCut: 'onCut',
      onLoad: 'onLoad',
      onError: 'onError',
    },
  },


  /**
   * Mobile Web Platform
   * Touch-optimized web platform with mobile-specific events
   */
  'mobile-web': {
    props: {
      // Most props remain the same for mobile web
      className: 'className',
      id: 'id',
      disabled: 'disabled',
      placeholder: 'placeholder',
      value: 'value',
      defaultValue: 'defaultValue',
      checked: 'checked',
      selected: 'selected',
      readOnly: 'readOnly',
      required: 'required',
      autoFocus: 'autoFocus',
      autoComplete: 'autoComplete',
      name: 'name',
      type: 'type',
      href: 'href',
      target: 'target',
      src: 'src',
      alt: 'alt',
      title: 'title',
      role: 'role',
      tabIndex: 'tabIndex',
      'aria-label': 'aria-label',
      'aria-describedby': 'aria-describedby',
      'aria-hidden': 'aria-hidden',
      'data-testid': 'data-testid',
      // Mobile-specific prop mappings
      size: 'size',
      variant: 'variant',
    },
    styles: {
      // Standard CSS properties (same as pc-web)
      width: 'width',
      height: 'height',
      minWidth: 'minWidth',
      maxWidth: 'maxWidth',
      minHeight: 'minHeight',
      maxHeight: 'maxHeight',
      padding: 'padding',
      paddingTop: 'paddingTop',
      paddingRight: 'paddingRight',
      paddingBottom: 'paddingBottom',
      paddingLeft: 'paddingLeft',
      margin: 'margin',
      marginTop: 'marginTop',
      marginRight: 'marginRight',
      marginBottom: 'marginBottom',
      marginLeft: 'marginLeft',
      display: 'display',
      flexDirection: 'flexDirection',
      justifyContent: 'justifyContent',
      alignItems: 'alignItems',
      alignSelf: 'alignSelf',
      flexWrap: 'flexWrap',
      flexGrow: 'flexGrow',
      flexShrink: 'flexShrink',
      gap: 'gap',
      rowGap: 'rowGap',
      columnGap: 'columnGap',
      position: 'position',
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left',
      zIndex: 'zIndex',
      overflow: 'overflow',
      overflowX: 'overflowX',
      overflowY: 'overflowY',
      backgroundColor: 'backgroundColor',
      color: 'color',
      fontSize: 'fontSize',
      fontWeight: 'fontWeight',
      fontFamily: 'fontFamily',
      fontStyle: 'fontStyle',
      lineHeight: 'lineHeight',
      textAlign: 'textAlign',
      textDecoration: 'textDecoration',
      textTransform: 'textTransform',
      letterSpacing: 'letterSpacing',
      border: 'border',
      borderWidth: 'borderWidth',
      borderStyle: 'borderStyle',
      borderColor: 'borderColor',
      borderRadius: 'borderRadius',
      borderTop: 'borderTop',
      borderRight: 'borderRight',
      borderBottom: 'borderBottom',
      borderLeft: 'borderLeft',
      boxShadow: 'boxShadow',
      opacity: 'opacity',
      cursor: 'cursor',
      visibility: 'visibility',
      transform: 'transform',
      transition: 'transition',
      // Mobile-specific style mappings
      WebkitTapHighlightColor: 'WebkitTapHighlightColor',
      WebkitOverflowScrolling: 'WebkitOverflowScrolling',
      touchAction: 'touchAction',
    },
    events: {
      // Mouse events mapped to touch events
      onClick: 'onTap',
      onDoubleClick: 'onDoubleTap',
      onMouseEnter: 'onTouchStart',
      onMouseLeave: 'onTouchEnd',
      onMouseDown: 'onTouchStart',
      onMouseUp: 'onTouchEnd',
      onMouseMove: 'onTouchMove',
      // Standard events that remain the same
      onChange: 'onChange',
      onInput: 'onInput',
      onSubmit: 'onSubmit',
      onFocus: 'onFocus',
      onBlur: 'onBlur',
      onKeyDown: 'onKeyDown',
      onKeyUp: 'onKeyUp',
      onKeyPress: 'onKeyPress',
      onScroll: 'onScroll',
      onLoad: 'onLoad',
      onError: 'onError',
      // Touch-specific events
      onTouchStart: 'onTouchStart',
      onTouchMove: 'onTouchMove',
      onTouchEnd: 'onTouchEnd',
      onTouchCancel: 'onTouchCancel',
      // Gesture events
      onSwipe: 'onSwipe',
      onSwipeLeft: 'onSwipeLeft',
      onSwipeRight: 'onSwipeRight',
      onSwipeUp: 'onSwipeUp',
      onSwipeDown: 'onSwipeDown',
      onPinch: 'onPinch',
      onLongPress: 'onLongPress',
    },
  },


  /**
   * Mobile Native Platform (React Native)
   * Native mobile platform with React Native conventions
   */
  'mobile-native': {
    props: {
      // React Native prop mappings
      className: 'style',
      id: 'testID',
      disabled: 'disabled',
      placeholder: 'placeholder',
      value: 'value',
      defaultValue: 'defaultValue',
      checked: 'value',
      selected: 'selected',
      readOnly: 'editable',
      required: 'required',
      autoFocus: 'autoFocus',
      autoComplete: 'autoComplete',
      name: 'nativeID',
      type: 'keyboardType',
      href: 'href',
      src: 'source',
      alt: 'accessibilityLabel',
      title: 'accessibilityLabel',
      role: 'accessibilityRole',
      tabIndex: 'tabIndex',
      'aria-label': 'accessibilityLabel',
      'aria-describedby': 'accessibilityHint',
      'aria-hidden': 'accessibilityElementsHidden',
      'data-testid': 'testID',
      // Component-specific mappings
      size: 'size',
      variant: 'variant',
      multiline: 'multiline',
      numberOfLines: 'numberOfLines',
      maxLength: 'maxLength',
      secureTextEntry: 'secureTextEntry',
      keyboardType: 'keyboardType',
      returnKeyType: 'returnKeyType',
      autoCapitalize: 'autoCapitalize',
      autoCorrect: 'autoCorrect',
      selectionColor: 'selectionColor',
      underlineColorAndroid: 'underlineColorAndroid',
    },
    styles: {
      // React Native style mappings (camelCase, no units)
      width: 'width',
      height: 'height',
      minWidth: 'minWidth',
      maxWidth: 'maxWidth',
      minHeight: 'minHeight',
      maxHeight: 'maxHeight',
      padding: 'padding',
      paddingTop: 'paddingTop',
      paddingRight: 'paddingRight',
      paddingBottom: 'paddingBottom',
      paddingLeft: 'paddingLeft',
      paddingHorizontal: 'paddingHorizontal',
      paddingVertical: 'paddingVertical',
      margin: 'margin',
      marginTop: 'marginTop',
      marginRight: 'marginRight',
      marginBottom: 'marginBottom',
      marginLeft: 'marginLeft',
      marginHorizontal: 'marginHorizontal',
      marginVertical: 'marginVertical',
      // Flex properties
      display: 'display',
      flex: 'flex',
      flexDirection: 'flexDirection',
      justifyContent: 'justifyContent',
      alignItems: 'alignItems',
      alignSelf: 'alignSelf',
      alignContent: 'alignContent',
      flexWrap: 'flexWrap',
      flexGrow: 'flexGrow',
      flexShrink: 'flexShrink',
      flexBasis: 'flexBasis',
      gap: 'gap',
      rowGap: 'rowGap',
      columnGap: 'columnGap',
      // Position properties
      position: 'position',
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left',
      zIndex: 'zIndex',
      overflow: 'overflow',
      // Visual properties
      backgroundColor: 'backgroundColor',
      color: 'color',
      opacity: 'opacity',
      // Typography
      fontSize: 'fontSize',
      fontWeight: 'fontWeight',
      fontFamily: 'fontFamily',
      fontStyle: 'fontStyle',
      lineHeight: 'lineHeight',
      textAlign: 'textAlign',
      textDecorationLine: 'textDecorationLine',
      textTransform: 'textTransform',
      letterSpacing: 'letterSpacing',
      // Border properties
      borderWidth: 'borderWidth',
      borderStyle: 'borderStyle',
      borderColor: 'borderColor',
      borderRadius: 'borderRadius',
      borderTopWidth: 'borderTopWidth',
      borderRightWidth: 'borderRightWidth',
      borderBottomWidth: 'borderBottomWidth',
      borderLeftWidth: 'borderLeftWidth',
      borderTopLeftRadius: 'borderTopLeftRadius',
      borderTopRightRadius: 'borderTopRightRadius',
      borderBottomLeftRadius: 'borderBottomLeftRadius',
      borderBottomRightRadius: 'borderBottomRightRadius',
      // Shadow properties (iOS)
      shadowColor: 'shadowColor',
      shadowOffset: 'shadowOffset',
      shadowOpacity: 'shadowOpacity',
      shadowRadius: 'shadowRadius',
      // Elevation (Android)
      elevation: 'elevation',
      // Transform
      transform: 'transform',
      // Web CSS to RN mappings
      textDecoration: 'textDecorationLine',
      boxShadow: 'elevation',
    },
    events: {
      // React Native event mappings
      onClick: 'onPress',
      onDoubleClick: 'onLongPress',
      onChange: 'onChangeText',
      onInput: 'onChangeText',
      onSubmit: 'onSubmitEditing',
      onFocus: 'onFocus',
      onBlur: 'onBlur',
      onKeyDown: 'onKeyPress',
      onKeyUp: 'onKeyPress',
      onKeyPress: 'onKeyPress',
      onMouseEnter: 'onPressIn',
      onMouseLeave: 'onPressOut',
      onMouseDown: 'onPressIn',
      onMouseUp: 'onPressOut',
      onScroll: 'onScroll',
      onLoad: 'onLoad',
      onError: 'onError',
      // Native-specific events
      onPress: 'onPress',
      onPressIn: 'onPressIn',
      onPressOut: 'onPressOut',
      onLongPress: 'onLongPress',
      onLayout: 'onLayout',
      onContentSizeChange: 'onContentSizeChange',
      onEndReached: 'onEndReached',
      onRefresh: 'onRefresh',
      onMomentumScrollBegin: 'onMomentumScrollBegin',
      onMomentumScrollEnd: 'onMomentumScrollEnd',
      onScrollBeginDrag: 'onScrollBeginDrag',
      onScrollEndDrag: 'onScrollEndDrag',
    },
  },


  /**
   * PC Desktop Platform (Electron/Tauri)
   * Desktop application platform with native window features
   */
  'pc-desktop': {
    props: {
      // Standard props (mostly same as pc-web)
      className: 'className',
      id: 'id',
      disabled: 'disabled',
      placeholder: 'placeholder',
      value: 'value',
      defaultValue: 'defaultValue',
      checked: 'checked',
      selected: 'selected',
      readOnly: 'readOnly',
      required: 'required',
      autoFocus: 'autoFocus',
      autoComplete: 'autoComplete',
      name: 'name',
      type: 'type',
      href: 'href',
      target: 'target',
      src: 'src',
      alt: 'alt',
      title: 'title',
      role: 'role',
      tabIndex: 'tabIndex',
      'aria-label': 'aria-label',
      'aria-describedby': 'aria-describedby',
      'aria-hidden': 'aria-hidden',
      'data-testid': 'data-testid',
      // Desktop-specific props
      draggable: 'draggable',
      resizable: 'resizable',
      minimizable: 'minimizable',
      maximizable: 'maximizable',
      closable: 'closable',
      alwaysOnTop: 'alwaysOnTop',
      fullscreenable: 'fullscreenable',
      skipTaskbar: 'skipTaskbar',
      frame: 'frame',
      transparent: 'transparent',
      hasShadow: 'hasShadow',
      vibrancy: 'vibrancy',
      titleBarStyle: 'titleBarStyle',
    },
    styles: {
      // Standard CSS properties (same as pc-web)
      width: 'width',
      height: 'height',
      minWidth: 'minWidth',
      maxWidth: 'maxWidth',
      minHeight: 'minHeight',
      maxHeight: 'maxHeight',
      padding: 'padding',
      paddingTop: 'paddingTop',
      paddingRight: 'paddingRight',
      paddingBottom: 'paddingBottom',
      paddingLeft: 'paddingLeft',
      margin: 'margin',
      marginTop: 'marginTop',
      marginRight: 'marginRight',
      marginBottom: 'marginBottom',
      marginLeft: 'marginLeft',
      display: 'display',
      flexDirection: 'flexDirection',
      justifyContent: 'justifyContent',
      alignItems: 'alignItems',
      alignSelf: 'alignSelf',
      flexWrap: 'flexWrap',
      flexGrow: 'flexGrow',
      flexShrink: 'flexShrink',
      gap: 'gap',
      rowGap: 'rowGap',
      columnGap: 'columnGap',
      position: 'position',
      top: 'top',
      right: 'right',
      bottom: 'bottom',
      left: 'left',
      zIndex: 'zIndex',
      overflow: 'overflow',
      overflowX: 'overflowX',
      overflowY: 'overflowY',
      backgroundColor: 'backgroundColor',
      color: 'color',
      fontSize: 'fontSize',
      fontWeight: 'fontWeight',
      fontFamily: 'fontFamily',
      fontStyle: 'fontStyle',
      lineHeight: 'lineHeight',
      textAlign: 'textAlign',
      textDecoration: 'textDecoration',
      textTransform: 'textTransform',
      letterSpacing: 'letterSpacing',
      border: 'border',
      borderWidth: 'borderWidth',
      borderStyle: 'borderStyle',
      borderColor: 'borderColor',
      borderRadius: 'borderRadius',
      borderTop: 'borderTop',
      borderRight: 'borderRight',
      borderBottom: 'borderBottom',
      borderLeft: 'borderLeft',
      boxShadow: 'boxShadow',
      opacity: 'opacity',
      cursor: 'cursor',
      visibility: 'visibility',
      transform: 'transform',
      transition: 'transition',
      // Desktop-specific styles
      WebkitAppRegion: 'WebkitAppRegion',
      WebkitUserSelect: 'WebkitUserSelect',
      userSelect: 'userSelect',
      backdropFilter: 'backdropFilter',
    },
    events: {
      // Standard DOM events
      onClick: 'onClick',
      onDoubleClick: 'onDoubleClick',
      onChange: 'onChange',
      onInput: 'onInput',
      onSubmit: 'onSubmit',
      onFocus: 'onFocus',
      onBlur: 'onBlur',
      onKeyDown: 'onKeyDown',
      onKeyUp: 'onKeyUp',
      onKeyPress: 'onKeyPress',
      onMouseEnter: 'onMouseEnter',
      onMouseLeave: 'onMouseLeave',
      onMouseDown: 'onMouseDown',
      onMouseUp: 'onMouseUp',
      onMouseMove: 'onMouseMove',
      onScroll: 'onScroll',
      onWheel: 'onWheel',
      onDragStart: 'onDragStart',
      onDrag: 'onDrag',
      onDragEnd: 'onDragEnd',
      onDrop: 'onDrop',
      onDragOver: 'onDragOver',
      onContextMenu: 'onContextMenu',
      onCopy: 'onCopy',
      onPaste: 'onPaste',
      onCut: 'onCut',
      onLoad: 'onLoad',
      onError: 'onError',
      // Desktop-specific events (Electron/Tauri)
      onWindowClose: 'onWindowClose',
      onWindowMinimize: 'onWindowMinimize',
      onWindowMaximize: 'onWindowMaximize',
      onWindowRestore: 'onWindowRestore',
      onWindowFocus: 'onWindowFocus',
      onWindowBlur: 'onWindowBlur',
      onWindowMove: 'onWindowMove',
      onWindowResize: 'onWindowResize',
      onWindowEnterFullScreen: 'onWindowEnterFullScreen',
      onWindowLeaveFullScreen: 'onWindowLeaveFullScreen',
      onFileDrop: 'onFileDrop',
      onNewWindow: 'onNewWindow',
      onBeforeQuit: 'onBeforeQuit',
      onWillQuit: 'onWillQuit',
      onQuit: 'onQuit',
    },
  },
};


/**
 * Component-specific platform mappings
 */
const componentMappings: Record<string, Record<PlatformType, Partial<PlatformMapping>>> = {
  Button: {
    'mobile-native': {
      props: {
        variant: 'type',
        size: 'size',
      },
      events: {
        onClick: 'onPress',
      },
    },
    'mobile-web': {
      events: {
        onClick: 'onTap',
      },
    },
    'pc-desktop': {},
    'pc-web': {},
  },
  Input: {
    'mobile-native': {
      props: {
        placeholder: 'placeholder',
        value: 'value',
        type: 'keyboardType',
      },
      events: {
        onChange: 'onChangeText',
      },
    },
    'mobile-web': {},
    'pc-desktop': {},
    'pc-web': {},
  },
};

/**
 * Apply mapping to props
 */
function mapProps(
  props: Record<string, unknown>,
  mapping: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(props)) {
    const mappedKey = mapping[key] || key;
    result[mappedKey] = value;
  }
  
  return result;
}

/**
 * Apply mapping to styles
 */
function mapStyles(
  styles: StyleProps,
  mapping: Record<string, string>
): StyleProps {
  const result: StyleProps = {};
  
  for (const [key, value] of Object.entries(styles)) {
    const mappedKey = mapping[key] || key;
    (result as Record<string, unknown>)[mappedKey] = value;
  }
  
  return result;
}

/**
 * Adapt a single component
 */
function adaptComponent(
  component: UIComponent,
  targetPlatform: PlatformType,
  registry?: ComponentRegistry
): UIComponent {
  const defaultMapping = defaultMappings[targetPlatform];
  const componentMapping = componentMappings[component.type]?.[targetPlatform];
  
  // Merge mappings (component-specific overrides default)
  const mapping: PlatformMapping = {
    props: { ...defaultMapping.props, ...componentMapping?.props },
    styles: { ...defaultMapping.styles, ...componentMapping?.styles },
    events: { ...defaultMapping.events, ...componentMapping?.events },
  };

  const adapted: UIComponent = {
    ...component,
    id: component.id,
    type: component.type,
  };

  // Map props
  if (component.props) {
    adapted.props = mapProps(component.props, mapping.props);
  }

  // Map styles
  if (component.style) {
    adapted.style = mapStyles(component.style, mapping.styles);
  }

  // Map events
  if (component.events) {
    adapted.events = component.events.map(event => ({
      ...event,
      event: mapping.events[event.event] || event.event,
    }));
  }

  // Recursively adapt children
  if (component.children) {
    adapted.children = component.children.map(child =>
      adaptComponent(child, targetPlatform, registry)
    );
  }

  return adapted;
}

/**
 * Platform Adapter class
 * 
 * Adapts UI schemas between different platforms.
 */
export class PlatformAdapter {
  private registry?: ComponentRegistry;
  private customMappings: Map<string, Record<PlatformType, PlatformMapping>> = new Map();

  constructor(registry?: ComponentRegistry) {
    this.registry = registry;
  }

  /**
   * Adapt a schema to target platform
   * @param schema - Source UI schema
   * @param targetPlatform - Target platform
   * @returns Adapted schema
   */
  adapt(schema: UISchema, targetPlatform: PlatformType): UISchema {
    return {
      ...schema,
      root: adaptComponent(schema.root, targetPlatform, this.registry),
    };
  }

  /**
   * Get mapping for a component between platforms
   * @param componentName - Component name
   * @param _sourcePlatform - Source platform (unused, reserved for future)
   * @param targetPlatform - Target platform
   * @returns Platform mapping
   */
  getMapping(
    componentName: string,
    _sourcePlatform: PlatformType,
    targetPlatform: PlatformType
  ): PlatformMapping {
    // Check custom mappings first
    const custom = this.customMappings.get(componentName)?.[targetPlatform];
    if (custom) return custom;

    // Check component-specific mappings
    const componentMapping = componentMappings[componentName]?.[targetPlatform];
    const defaultMapping = defaultMappings[targetPlatform];

    return {
      props: { ...defaultMapping.props, ...componentMapping?.props },
      styles: { ...defaultMapping.styles, ...componentMapping?.styles },
      events: { ...defaultMapping.events, ...componentMapping?.events },
    };
  }

  /**
   * Check if a component is supported on a platform
   * @param componentName - Component name
   * @param platform - Target platform
   * @returns True if supported
   */
  isSupported(componentName: string, platform: PlatformType): boolean {
    if (!this.registry) return true;
    
    const definition = this.registry.get(componentName);
    if (!definition) return false;
    
    // If no platforms specified, assume all supported
    if (!definition.platforms || definition.platforms.length === 0) {
      return true;
    }
    
    return definition.platforms.includes(platform);
  }

  /**
   * Register custom mapping for a component
   */
  registerMapping(
    componentName: string,
    platform: PlatformType,
    mapping: PlatformMapping
  ): void {
    if (!this.customMappings.has(componentName)) {
      this.customMappings.set(componentName, {} as Record<PlatformType, PlatformMapping>);
    }
    this.customMappings.get(componentName)![platform] = mapping;
  }

  /**
   * Get all unsupported components for a platform
   */
  getUnsupportedComponents(platform: PlatformType): string[] {
    if (!this.registry) return [];
    
    return this.registry.getAll().filter(def => {
      if (!def.platforms || def.platforms.length === 0) return false;
      return !def.platforms.includes(platform);
    }).map(def => def.name);
  }
}

/**
 * Create a platform adapter
 */
export function createPlatformAdapter(registry?: ComponentRegistry): PlatformAdapter {
  return new PlatformAdapter(registry);
}

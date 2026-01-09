/**
 * @file components-debug.test.ts
 * @description 调试组件导入问题
 */

import { describe, it, expect } from 'vitest';

describe('Debug Components Import', () => {
  it('should import ComponentRegistry', async () => {
    const { ComponentRegistry } = await import('../../../core/component-registry');
    expect(ComponentRegistry).toBeDefined();
  });

  it('should import icon-registry', async () => {
    const { defaultIconRegistry, initializeDefaultIcons } = await import('../../../utils/icon-registry');
    expect(defaultIconRegistry).toBeDefined();
    expect(initializeDefaultIcons).toBeDefined();
  });

  it('should import Button', async () => {
    const { Button } = await import('../../../../components/ui/button');
    expect(Button).toBeDefined();
  });

  it('should import components.ts', async () => {
    try {
      // 先尝试直接导入看看错误
      const mod = await import('./components');
      console.log('Module:', mod);
      console.log('Module keys:', Object.keys(mod));
      console.log('discordComponents:', mod.discordComponents);
      expect(mod.discordComponents).toBeDefined();
    } catch (e) {
      console.error('Import error:', e);
      throw e;
    }
  });

  it('should create registry directly', async () => {
    const { ComponentRegistry } = await import('../../../core/component-registry');
    const { defaultIconRegistry, initializeDefaultIcons } = await import('../../../icon-registry');
    const { Button } = await import('../../../../components/ui/button');
    
    if (defaultIconRegistry.size === 0) initializeDefaultIcons();
    
    const registry = new ComponentRegistry();
    registry.register({
      name: 'Button',
      component: Button,
      category: 'input',
      description: 'Button',
      propsSchema: {},
    });
    
    expect(registry.has('Button')).toBe(true);
  });
});

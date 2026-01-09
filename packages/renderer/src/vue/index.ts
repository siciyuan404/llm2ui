/**
 * LLM2UI Vue SDK
 * 
 * Vue 3-specific exports for the LLM2UI SDK.
 * 
 * Note: This module requires Vue 3 as a peer dependency.
 * 
 * @module @llm2ui/renderer/vue
 */

export {
  LLM2UI,
  default,
  createLLM2UIComponent,
  useLLM2UI,
  isVueAvailable,
} from './LLM2UI';

export type {
  LLM2UIProps,
  LLM2UIEmits,
  LLM2UIEvent,
  CustomComponentDefinition,
} from './LLM2UI';

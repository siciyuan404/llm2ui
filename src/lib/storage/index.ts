/**
 * Storage Module Index
 * 
 * 持久化模块，包含自定义模型管理器等存储相关功能。
 * 
 * @module storage
 */

// Custom Model Manager
export {
  // Types
  type CustomModel,
  type ModelInfo,
  type ModelValidationError,
  type ModelValidationResult,
  type ModelOperationErrorCode,
  ModelOperationError,
  
  // Constants
  CUSTOM_MODELS_STORAGE_KEY,
  
  // Functions
  generateModelId,
  validateModel,
  addModel,
  isPresetModel,
  updateModel,
  deleteModel,
  getCustomModels,
  getCustomModelById,
  getAllModels,
  searchModels,
  saveToStorage,
  loadFromStorage,
  clearAllCustomModels,
  clearInMemoryModels,
} from './custom-model-manager';

/**
 * Utils Module
 * 
 * 通用工具函数模块，提供类名合并和唯一 ID 生成等功能。
 * 
 * @module lib/utils/utils
 * @see Requirements 1.1, 1.8
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并类名，支持条件类名和 Tailwind CSS 类名冲突解决
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 生成唯一 ID
 * @param prefix - ID 前缀
 * @returns 带前缀的唯一 ID 字符串
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

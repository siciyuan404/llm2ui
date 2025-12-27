// input: ClassValue[] - 类名数组，支持条件类名
// output: string - 合并后的类名字符串
// pos: src/lib - 通用工具函数模块
// 一旦我被更新，务必更新我的开头注释，以及所属的文件夹的 README.md

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

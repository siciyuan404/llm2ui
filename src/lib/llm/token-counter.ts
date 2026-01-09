/**
 * @file Token 计数器
 * @description 估算文本的 Token 数量，支持中英文混合文本
 * @module lib/llm/token-counter
 */

/**
 * Token 计数详细结果
 */
export interface TokenCountResult {
  /** 总 Token 数 */
  total: number;
  /** 英文字符 Token 数 */
  english: number;
  /** 中文字符 Token 数 */
  chinese: number;
  /** 其他字符 Token 数 */
  other: number;
}

/**
 * Token 计数器接口
 */
export interface ITokenCounter {
  countTokens(text: string): number;
  countTokensDetailed(text: string): TokenCountResult;
}

/**
 * Token 计数器
 * 
 * 使用字符近似法估算 Token 数量：
 * - 英文: 1 token ≈ 4 characters
 * - 中文: 1 token ≈ 1.5 characters
 */
export class TokenCounter implements ITokenCounter {
  /** 英文字符的 Token 比率 (4 字符 ≈ 1 token) */
  private readonly englishRatio = 4;
  
  /** 中文字符的 Token 比率 (1.5 字符 ≈ 1 token) */
  private readonly chineseRatio = 1.5;
  
  /** 其他字符的 Token 比率 (使用英文比率) */
  private readonly otherRatio = 4;

  /**
   * 检测字符是否为中文
   */
  private isChinese(char: string): boolean {
    const code = char.charCodeAt(0);
    // CJK Unified Ideographs: U+4E00 - U+9FFF
    // CJK Unified Ideographs Extension A: U+3400 - U+4DBF
    // CJK Compatibility Ideographs: U+F900 - U+FAFF
    return (
      (code >= 0x4E00 && code <= 0x9FFF) ||
      (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0xF900 && code <= 0xFAFF)
    );
  }

  /**
   * 检测字符是否为英文字母或数字
   */
  private isEnglish(char: string): boolean {
    const code = char.charCodeAt(0);
    // A-Z: 65-90, a-z: 97-122, 0-9: 48-57
    return (
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      (code >= 48 && code <= 57)
    );
  }

  /**
   * 计算文本的估算 Token 数
   */
  countTokens(text: string): number {
    const detailed = this.countTokensDetailed(text);
    return detailed.total;
  }

  /**
   * 计算详细的 Token 分布
   */
  countTokensDetailed(text: string): TokenCountResult {
    if (!text || text.length === 0) {
      return { total: 0, english: 0, chinese: 0, other: 0 };
    }

    let englishChars = 0;
    let chineseChars = 0;
    let otherChars = 0;

    for (const char of text) {
      if (this.isChinese(char)) {
        chineseChars++;
      } else if (this.isEnglish(char)) {
        englishChars++;
      } else {
        otherChars++;
      }
    }

    const englishTokens = Math.ceil(englishChars / this.englishRatio);
    const chineseTokens = Math.ceil(chineseChars / this.chineseRatio);
    const otherTokens = Math.ceil(otherChars / this.otherRatio);

    return {
      total: englishTokens + chineseTokens + otherTokens,
      english: englishTokens,
      chinese: chineseTokens,
      other: otherTokens,
    };
  }

  /**
   * 检测文本的主要语言
   */
  detectLanguage(text: string): 'zh' | 'en' | 'mixed' {
    if (!text || text.length === 0) {
      return 'en';
    }

    let chineseCount = 0;
    let englishCount = 0;

    for (const char of text) {
      if (this.isChinese(char)) {
        chineseCount++;
      } else if (this.isEnglish(char)) {
        englishCount++;
      }
    }

    const total = chineseCount + englishCount;
    if (total === 0) return 'en';

    // 如果两种语言都存在且都超过一定比例，则为混合
    if (chineseCount > 0 && englishCount > 0) {
      const chineseRatio = chineseCount / total;
      const englishRatio = englishCount / total;
      
      // 如果任一语言占比超过 80%，则认为是该语言为主
      if (chineseRatio > 0.8) return 'zh';
      if (englishRatio > 0.8) return 'en';
      return 'mixed';
    }

    // 只有一种语言
    if (chineseCount > 0) return 'zh';
    return 'en';
  }
}

// 默认导出单例实例
export const tokenCounter = new TokenCounter();

/**
 * @file incremental-parser.ts
 * @description 增量 JSON 解析器，支持解析不完整的 JSON 字符串
 * @module lib/validation/streaming/incremental-parser
 * @requirements REQ-2.1, REQ-2.2, REQ-2.3, REQ-2.4, REQ-2.5, REQ-2.6
 */

import type {
  IncrementalParseResult,
  ParseError,
  ParserState,
  StackFrame,
} from './types';

// ============================================================================
// 常量
// ============================================================================

const MAX_DEPTH = 100;
const WHITESPACE = /\s/;

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 创建初始解析器状态
 */
function createInitialState(): ParserState {
  return {
    stack: [],
    position: 0,
    consumed: 0,
    line: 1,
    column: 1,
    buffer: '',
  };
}

/**
 * 构建当前路径字符串
 */
function buildPath(stack: StackFrame[]): string {
  if (stack.length === 0) return '';
  
  const parts: string[] = ['root'];
  for (let i = 1; i < stack.length; i++) {
    const frame = stack[i];
    if (frame.type === 'array' && frame.index !== undefined) {
      parts.push(`[${frame.index}]`);
    } else if (frame.key !== undefined) {
      parts.push(`.${frame.key}`);
    }
  }
  return parts.join('');
}

/**
 * 创建解析错误
 */
function createError(
  message: string,
  state: ParserState
): ParseError {
  return {
    message,
    line: state.line,
    column: state.column,
    path: buildPath(state.stack),
    position: state.position,
  };
}

/**
 * 跳过空白字符
 */
function skipWhitespace(input: string, state: ParserState): void {
  while (state.position < input.length) {
    const char = input[state.position];
    if (!WHITESPACE.test(char)) break;
    
    if (char === '\n') {
      state.line++;
      state.column = 1;
    } else {
      state.column++;
    }
    state.position++;
  }
}

/**
 * 解析字符串
 */
function parseString(
  input: string,
  state: ParserState
): { value: string; complete: boolean } | null {
  if (input[state.position] !== '"') return null;
  
  state.position++;
  state.column++;
  
  let value = '';
  let escaped = false;
  
  while (state.position < input.length) {
    const char = input[state.position];
    
    if (escaped) {
      switch (char) {
        case '"':
        case '\\':
        case '/':
          value += char;
          break;
        case 'b':
          value += '\b';
          break;
        case 'f':
          value += '\f';
          break;
        case 'n':
          value += '\n';
          break;
        case 'r':
          value += '\r';
          break;
        case 't':
          value += '\t';
          break;
        case 'u':
          // Unicode escape
          if (state.position + 4 < input.length) {
            const hex = input.slice(state.position + 1, state.position + 5);
            if (/^[0-9a-fA-F]{4}$/.test(hex)) {
              value += String.fromCharCode(parseInt(hex, 16));
              state.position += 4;
              state.column += 4;
            } else {
              value += char;
            }
          } else {
            // 不完整的 unicode 转义
            return { value, complete: false };
          }
          break;
        default:
          value += char;
      }
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '"') {
      state.position++;
      state.column++;
      return { value, complete: true };
    } else if (char === '\n') {
      state.line++;
      state.column = 1;
      value += char;
    } else {
      value += char;
    }
    
    state.position++;
    state.column++;
  }
  
  // 字符串未闭合
  return { value, complete: false };
}

/**
 * 解析数字
 */
function parseNumber(
  input: string,
  state: ParserState
): { value: number; complete: boolean } | null {
  const start = state.position;
  let numStr = '';
  
  // 负号
  if (input[state.position] === '-') {
    numStr += '-';
    state.position++;
    state.column++;
  }
  
  // 整数部分
  if (state.position >= input.length) {
    return { value: 0, complete: false };
  }
  
  if (input[state.position] === '0') {
    numStr += '0';
    state.position++;
    state.column++;
  } else if (/[1-9]/.test(input[state.position])) {
    while (state.position < input.length && /[0-9]/.test(input[state.position])) {
      numStr += input[state.position];
      state.position++;
      state.column++;
    }
  } else {
    state.position = start;
    return null;
  }
  
  // 小数部分
  if (state.position < input.length && input[state.position] === '.') {
    numStr += '.';
    state.position++;
    state.column++;
    
    if (state.position >= input.length) {
      return { value: parseFloat(numStr), complete: false };
    }
    
    while (state.position < input.length && /[0-9]/.test(input[state.position])) {
      numStr += input[state.position];
      state.position++;
      state.column++;
    }
  }
  
  // 指数部分
  if (state.position < input.length && /[eE]/.test(input[state.position])) {
    numStr += input[state.position];
    state.position++;
    state.column++;
    
    if (state.position >= input.length) {
      return { value: parseFloat(numStr), complete: false };
    }
    
    if (input[state.position] === '+' || input[state.position] === '-') {
      numStr += input[state.position];
      state.position++;
      state.column++;
    }
    
    if (state.position >= input.length) {
      return { value: parseFloat(numStr), complete: false };
    }
    
    while (state.position < input.length && /[0-9]/.test(input[state.position])) {
      numStr += input[state.position];
      state.position++;
      state.column++;
    }
  }
  
  // 检查是否到达输入末尾（可能不完整）
  if (state.position >= input.length) {
    // 如果数字后面没有分隔符，可能不完整
    return { value: parseFloat(numStr), complete: false };
  }
  
  return { value: parseFloat(numStr), complete: true };
}

/**
 * 解析字面量 (true, false, null)
 */
function parseLiteral(
  input: string,
  state: ParserState
): { value: boolean | null; complete: boolean } | null {
  const remaining = input.slice(state.position);
  
  for (const [literal, value] of [
    ['true', true],
    ['false', false],
    ['null', null],
  ] as const) {
    if (remaining.startsWith(literal)) {
      state.position += literal.length;
      state.column += literal.length;
      return { value, complete: true };
    }
    // 部分匹配
    if (literal.startsWith(remaining) && remaining.length < literal.length) {
      state.position += remaining.length;
      state.column += remaining.length;
      return { value, complete: false };
    }
  }
  
  return null;
}

// ============================================================================
// 主解析器类
// ============================================================================

/**
 * 增量 JSON 解析器
 */
export class IncrementalParser {
  private state: ParserState;
  
  constructor() {
    this.state = createInitialState();
  }
  
  /**
   * 获取当前状态
   */
  getState(): ParserState {
    return { ...this.state, stack: [...this.state.stack] };
  }
  
  /**
   * 重置解析器
   */
  reset(): void {
    this.state = createInitialState();
  }
  
  /**
   * 解析 JSON 片段
   */
  parse(input: string): IncrementalParseResult {
    // 累积输入
    this.state.buffer += input;
    const fullInput = this.state.buffer;
    
    // 重置位置到上次消费的位置
    this.state.position = this.state.consumed;
    
    try {
      const result = this.parseValue(fullInput);
      
      // 更新消费位置
      this.state.consumed = this.state.position;
      
      return {
        partial: !result.complete,
        value: result.value,
        pendingPath: buildPath(this.state.stack),
        state: this.getState(),
        error: undefined,
      };
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      return {
        partial: true,
        value: this.buildPartialValue(),
        pendingPath: buildPath(this.state.stack),
        state: this.getState(),
        error: createError(error.message, this.state),
      };
    }
  }
  
  /**
   * 从上次状态恢复解析
   */
  resume(chunk: string): IncrementalParseResult {
    return this.parse(chunk);
  }
  
  /**
   * 解析值
   */
  private parseValue(input: string): { value: unknown; complete: boolean } {
    skipWhitespace(input, this.state);
    
    if (this.state.position >= input.length) {
      return { value: undefined, complete: false };
    }
    
    // 检查嵌套深度
    if (this.state.stack.length > MAX_DEPTH) {
      throw new Error(`Maximum nesting depth (${MAX_DEPTH}) exceeded`);
    }
    
    const char = input[this.state.position];
    
    switch (char) {
      case '{':
        return this.parseObject(input);
      case '[':
        return this.parseArray(input);
      case '"':
        return this.parseStringValue(input);
      case '-':
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        return this.parseNumberValue(input);
      case 't':
      case 'f':
      case 'n':
        return this.parseLiteralValue(input);
      default:
        throw new Error(`Unexpected character '${char}'`);
    }
  }
  
  /**
   * 解析对象
   */
  private parseObject(input: string): { value: Record<string, unknown>; complete: boolean } {
    this.state.position++; // 跳过 '{'
    this.state.column++;
    
    const obj: Record<string, unknown> = {};
    const frame: StackFrame = { type: 'object', value: obj, expectingKey: true };
    this.state.stack.push(frame);
    
    skipWhitespace(input, this.state);
    
    // 空对象
    if (this.state.position < input.length && input[this.state.position] === '}') {
      this.state.position++;
      this.state.column++;
      this.state.stack.pop();
      return { value: obj, complete: true };
    }
    
    while (this.state.position < input.length) {
      skipWhitespace(input, this.state);
      
      if (this.state.position >= input.length) {
        return { value: obj, complete: false };
      }
      
      // 解析键
      if (input[this.state.position] !== '"') {
        if (input[this.state.position] === '}') {
          this.state.position++;
          this.state.column++;
          this.state.stack.pop();
          return { value: obj, complete: true };
        }
        throw new Error('Expected string key');
      }
      
      const keyResult = parseString(input, this.state);
      if (!keyResult) {
        throw new Error('Invalid string key');
      }
      if (!keyResult.complete) {
        return { value: obj, complete: false };
      }
      
      const key = keyResult.value;
      frame.key = key;
      frame.expectingKey = false;
      frame.expectingValue = true;
      
      skipWhitespace(input, this.state);
      
      if (this.state.position >= input.length) {
        return { value: obj, complete: false };
      }
      
      // 期望冒号
      if (input[this.state.position] !== ':') {
        throw new Error('Expected colon');
      }
      this.state.position++;
      this.state.column++;
      
      skipWhitespace(input, this.state);
      
      if (this.state.position >= input.length) {
        return { value: obj, complete: false };
      }
      
      // 解析值
      const valueResult = this.parseValue(input);
      obj[key] = valueResult.value;
      frame.expectingValue = false;
      
      if (!valueResult.complete) {
        return { value: obj, complete: false };
      }
      
      skipWhitespace(input, this.state);
      
      if (this.state.position >= input.length) {
        return { value: obj, complete: false };
      }
      
      const nextChar = input[this.state.position];
      if (nextChar === '}') {
        this.state.position++;
        this.state.column++;
        this.state.stack.pop();
        return { value: obj, complete: true };
      } else if (nextChar === ',') {
        this.state.position++;
        this.state.column++;
        frame.expectingKey = true;
      } else {
        throw new Error(`Expected ',' or '}', got '${nextChar}'`);
      }
    }
    
    return { value: obj, complete: false };
  }
  
  /**
   * 解析数组
   */
  private parseArray(input: string): { value: unknown[]; complete: boolean } {
    this.state.position++; // 跳过 '['
    this.state.column++;
    
    const arr: unknown[] = [];
    const frame: StackFrame = { type: 'array', value: arr, index: 0 };
    this.state.stack.push(frame);
    
    skipWhitespace(input, this.state);
    
    // 空数组
    if (this.state.position < input.length && input[this.state.position] === ']') {
      this.state.position++;
      this.state.column++;
      this.state.stack.pop();
      return { value: arr, complete: true };
    }
    
    while (this.state.position < input.length) {
      skipWhitespace(input, this.state);
      
      if (this.state.position >= input.length) {
        return { value: arr, complete: false };
      }
      
      if (input[this.state.position] === ']') {
        this.state.position++;
        this.state.column++;
        this.state.stack.pop();
        return { value: arr, complete: true };
      }
      
      // 解析元素
      const valueResult = this.parseValue(input);
      arr.push(valueResult.value);
      frame.index = arr.length;
      
      if (!valueResult.complete) {
        return { value: arr, complete: false };
      }
      
      skipWhitespace(input, this.state);
      
      if (this.state.position >= input.length) {
        return { value: arr, complete: false };
      }
      
      const nextChar = input[this.state.position];
      if (nextChar === ']') {
        this.state.position++;
        this.state.column++;
        this.state.stack.pop();
        return { value: arr, complete: true };
      } else if (nextChar === ',') {
        this.state.position++;
        this.state.column++;
      } else {
        throw new Error(`Expected ',' or ']', got '${nextChar}'`);
      }
    }
    
    return { value: arr, complete: false };
  }
  
  /**
   * 解析字符串值
   */
  private parseStringValue(input: string): { value: string; complete: boolean } {
    const result = parseString(input, this.state);
    if (!result) {
      throw new Error('Invalid string');
    }
    return result;
  }
  
  /**
   * 解析数字值
   */
  private parseNumberValue(input: string): { value: number; complete: boolean } {
    const result = parseNumber(input, this.state);
    if (!result) {
      throw new Error('Invalid number');
    }
    return result;
  }
  
  /**
   * 解析字面量值
   */
  private parseLiteralValue(input: string): { value: boolean | null; complete: boolean } {
    const result = parseLiteral(input, this.state);
    if (!result) {
      throw new Error('Invalid literal');
    }
    return result;
  }
  
  /**
   * 构建部分值（从栈中重建）
   */
  private buildPartialValue(): unknown {
    if (this.state.stack.length === 0) {
      return undefined;
    }
    return this.state.stack[0].value;
  }
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建增量解析器实例
 */
export function createIncrementalParser(): IncrementalParser {
  return new IncrementalParser();
}

/**
 * 一次性解析（便捷函数）
 */
export function parseIncremental(input: string): IncrementalParseResult {
  const parser = new IncrementalParser();
  return parser.parse(input);
}

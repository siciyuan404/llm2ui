/**
 * Clipboard Utilities
 *
 * Provides cross-browser clipboard operations with fallback support.
 *
 * @module lib/utils/clipboard
 */

/**
 * Copy text to clipboard with fallback for older browsers
 *
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - true if copy succeeded, false otherwise
 *
 * @example
 * ```typescript
 * const success = await copyToClipboard('Hello World');
 * if (success) {
 *   console.log('Copied!');
 * }
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers or when clipboard API is not available
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

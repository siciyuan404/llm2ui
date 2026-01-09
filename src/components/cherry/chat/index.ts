/**
 * @file 聊天组件入口
 * @description 导出 Message、Inputbar 等聊天相关组件
 * @module components/cherry/chat
 */

export { Message } from './Message';
export type { MessageProps, MessageRole } from './Message';

export { MessageHeader } from './MessageHeader';
export type { MessageHeaderProps } from './MessageHeader';

export { MessageContent } from './MessageContent';
export type { MessageContentProps, MessageBlock } from './MessageContent';

export { MessageFooter } from './MessageFooter';
export type { MessageFooterProps } from './MessageFooter';

export { Inputbar } from './Inputbar';
export type { InputbarProps, Attachment, MentionedModel } from './Inputbar';

export { InputbarTools } from './InputbarTools';
export type { InputbarToolsProps, InputbarTool } from './InputbarTools';

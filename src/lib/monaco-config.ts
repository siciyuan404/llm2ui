/**
 * Monaco Editor Configuration
 * 
 * Configures Monaco Editor to load from local node_modules instead of CDN.
 * This resolves loading issues in environments with restricted network access.
 * 
 * @module lib/monaco-config
 */

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Configure Monaco to use local installation
loader.config({ monaco });

export { monaco };

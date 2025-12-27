# LLM2UI Packages

This directory contains publishable NPM packages for the LLM2UI project.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [@llm2ui/renderer](./renderer) | JSON Renderer SDK - Render UI from JSON schemas | 🚧 In Development |

## Development

### Building Packages

```bash
# Build all packages
npm run build:packages

# Build specific package
cd packages/renderer
npm run build
```

### Publishing

```bash
# Publish to NPM (requires authentication)
cd packages/renderer
npm publish --access public
```

## Package Structure

```
packages/
├── renderer/           # @llm2ui/renderer package
│   ├── src/           # Source files (re-exports from main src/sdk)
│   ├── dist/          # Built output (generated)
│   ├── package.json   # Package configuration
│   ├── tsconfig.json  # TypeScript configuration
│   ├── vite.config.ts # Build configuration
│   ├── README.md      # Package documentation
│   └── LICENSE        # MIT License
└── README.md          # This file
```

## Requirements Validation

- **13.1**: NPM package support ✓
- **13.2**: JSON Schema renderer with `render(schema, container)` ✓
- **13.3**: Tree-shaking support via ESM exports ✓
- **13.4**: TypeScript type definitions ✓
- **13.5**: README documentation ✓

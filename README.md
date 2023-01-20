# mage-stash

Customisable content management system written in TypeScript.

## Immediate Roadmap

1. More descriptive variables, less comments
2. Unified plugin loading code with Quartermasters support (see ``src/plugins.ts``)
3. Fix atomic read/write operations with manifests (see ```src/manifest.ts``` for more)
4. Automatic plugin loading on start-up (dedicated plugins folder? plugin signing for safety?)

## General To-dos

- Content grouping by reference, something like bookmarks (reference Wisps?)
- Support for individual plugin settings which the user can change
- Expanded search functionality for manifests (metadata-only, content-only, id-only, includes-metadata-field etc), possibly through a tree-like read iterator
- Profiler for recording individual plugin metrics
- **BIG** Both TUI and GUI packages, probably external repos

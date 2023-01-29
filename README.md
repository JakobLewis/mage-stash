# mage-stash

Customisable content management system written in TypeScript.

> **WARNING:** This program arbitrarily executes all JavaScript files in `./lib/plugins` when passed `--autoload` as an argument, such as during `npm run build`.

## Immediate Roadmap

1. More descriptive variables, less comments
2. Fix atomic read/write operations with manifests
3. Add support for custom manifests

## General To-dos

- Make automatic loading of plugins more secure
- Content grouping by reference, something like bookmarks (reference Wisps?)
- Proper Plugin name standards and validation with Regex
- Support for individual plugin settings which the user can change
- Expanded search functionality for manifests (metadata-only, content-only, id-only, includes-metadata-field etc), possibly through a tree-like read iterator
- Profiler for recording individual plugin metrics
- **BIG** Both TUI and GUI packages, probably external repos

# mage-stash

Plugin-based content management system written in TypeScript.

## General Goals

- Stabilised API
- Documentation
- Complete test coverage
- Performance profiling support

## Immediate Roadmap

1. Add in-memory Wisp tree utility class for sorting and searching
2. Refactor `fsCache.ts` for better readability
3. Cap Manifest concurrent operations to 100 at a time
4. Add `walk()` Iterator method to `manifest.ts` for memory-efficient Wisp searching

## General To-dos

- More realistic/real-world testcases in `manifest.test.ts` such as writing a deeper Wisp tree
- Compensate for removed Manifests when iterating over them in `manifest.ts`
- Include a `github` plugin as demo
- Allow batch-writing to Manifests
- Allow Library plugins to supply an items-of-interest list that gets automatically cached by `manifest.ts`
- Ensure all plugin names are alphanumeric
- Utility functions for fine-grain Manifest searching build on `walk()`
- Debug method that wraps Plugins and tracks usage + performance

## Features under Consideration

- Global configuration settings
- Layout API for Manifests that returns a list of all stored wisp paths
- Testing cases where typing rules are broken
- Option for sandboxed Plugins to ensure Manifest operations never clash
- Blob file writing API
- Account, Translator, Exporter, Notifications and Formatter domains
- Rename Manifest to Bookshelf for clarity
- Foreign-Plugin API that uses sockets for inter-process Plugin loading and communication
- CLI for regularly refreshing cached Wisps
- Pretty TUI that lists all actions being performed :D

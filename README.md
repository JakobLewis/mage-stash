# mage-stash

Plugin-based content management system written in TypeScript.

## General Goals

- Stabilised API
- Documentation
- Complete test coverage
- Performance profiling support

## Immediate Roadmap

1. Add an asynchronous lock class to `manifest.ts`
2. Rewrite `fsCache.ts`
3. Add `memoryCache.ts`
4. Add `walk()` Iterator method to `manifest.ts` for efficient Wisp searching
5. Add plugin settings

## General To-dos

- Compensate for removed manifests when iterating over them in `manifest.ts`
- Consider the extent to which Handlers own their plugins; should plugins be removed when their handler is?
- Allow plugins to specify a maximum number of parallel asynchronous operations
- Include a `github` plugin as demo
- Allow batch-writing to Manifests
- Create a proper testing system
- More descriptive variable names, less comments, general ergonomic improvements
- Content grouping by reference, something like bookmarks (reference Wisps?)
- Ensure all plugin names are alphanumeric
- Utility functions for fine-grain Manifest searching
- Profiler for recording plugin metrics
- Support for plugins which can transform other wisps i.e. reading lists, accounts, translators, exporters, notifications & formatters

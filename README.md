# mage-stash

Plugin-based content management system written in TypeScript.

> **WARNING:** This program arbitrarily executes all JavaScript files in `./lib/plugins` when passed `--autoload` as an argument, such as during `npm run build`.

## General Goals

- Stabilised API
- Documentation
- Complete test coverage
- Performance profiling support

## Immediate Roadmap

1. Remove `lzutf8` dependency
2. Turn `manifest.ts` & `library.ts` into plugins
3. Add an asynchronous lock class to `manifest.ts`
4. Rewrite `fsCache.ts`
5. Rewrite `memoryCache.ts`
6. Add `walk()` Iterator method to `manifest.ts` for efficient Wisp searching
7. Enable persistent storage for individual plugin settings
8. Allow Manifest plugins to specify a maximum number of parallel asynchronous operations

## General To-dos

- Reconsider plugin autoloading
- Manifest and Library stream APIs
- Consider the extent to which Handlers own their plugins; should plugins be removed when their handler is?
- Place expensive parts of `strings.ts` in a worker thread
- Include a `github` plugin as demo
- Allow batch-writing to Manifests
- Add log parsing capabilities
- Turn `logger.ts` into a plugin
- Create a proper testing system
- More descriptive variable names, less comments, general ergonomic improvements
- Content grouping by reference, something like bookmarks (reference Wisps?)
- Ensure all plugin names are alphanumeric
- Utility functions for fine-grain Manifest searching
- Profiler for recording plugin metrics
- Support for plugins which can transform other wisps i.e. translators, exporters, notifications & formatters

# mage-stash

Plugin-based content management system (CMS) with dynamic dispatch.

## Installation

### NPM Dependency

```bash
npm install https://github.com/JakobLewis/mage-stash
```

### Git Project

```bash
git clone https://github.com/JakobLewis/mage-stash
```

## General Goals

- Stabilised API
- Documentation
- Complete test coverage
- Performance profiling support

## Immediate Roadmap

1. Add in-memory Wisp tree utility class for caching
2. Refactor `fsCache.ts` for better readability

## General To-dos

- Finish documentation
- Include a `github` plugin as demo
- Allow batch-writing to Manifests
- Add removal/addition hooks for adding and removing domain plugins
- Ensure all plugin names are alphanumeric
- Utility functions for fine-grain Manifest searching built on `walk()`
- Debug method that wraps Plugins and tracks usage + performance

## Features under Consideration

- Move to node:test for less dependencies and hopefully process.on('exit') handlers
- Global configuration settings
- Custom command for adding plugins from GitHub that can then be easily updated
- Use Zod for runtime type validation
- Layout API for Manifests that returns a list of all stored wisp paths
- Testing cases where typing rules are broken
- Option for sandboxed Plugins to ensure Manifest operations never clash
- Blob file writing API
- Account, Translator, Exporter, Notifications and Formatter domains
- Rename Manifest to Bookshelf for clarity
- Foreign-Plugin API that uses sockets for inter-process Plugin loading and communication
- CLI for regularly refreshing cached Wisps
- Pretty TUI that lists all actions being performed :

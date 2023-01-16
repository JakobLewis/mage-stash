# mage-stash

Customisable content management system written in TypeScript.

## TODO

1. Better formatting, commenting and general organisation of all tokens
2. Descriptive and helpful logs
3. Fix atomic read/write operations with manifests (see ```src/manifest.ts``` for more)
4. Custom plugin managers (Quartermasters?) which can then be safely accessed by external plugins (Accounts/Personas, Exporters)
5. Content grouping by reference, something like bookmarks (reference Wisps?)
6. Support for individual plugin settings which the user can change
7. Expanded search functionality for manifests (metadata-only, content-only, id-only, includes-metadata-field etc), possibly through a tree-like read iterator
8. Profiler for recording individual plugin metrics
9. **BIG** Both TUI and GUI packages, probably external repos

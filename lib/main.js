import * as Logger from './logging.js';
Logger.default.write(3, 'main.js', `Starting with args=['${process.argv.slice(2, process.argv.length).join('\', \'')}']`, true);
export * as Strings from './strings.js';
export * as Wisp from './wisp.js';
export * as Plugin from './plugin.js';
export * as Library from './library.js';
export * as Manifest from './manifest.js';
Logger.default.write(3, 'main.js', 'MageStash initialisation completed', true);
export { Logger };

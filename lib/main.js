import * as Logger from './logging.js';
Logger.default.write(3, 'main.js', `Starting with args=['${process.argv.slice(2, process.argv.length).join('\', \'')}']`, true);
export * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
export * as Strings from './strings.js';
export * as Library from './library.js';
import Manifest from './manifest.js';
Plugin.load(Manifest);
import { load as autoload } from './autoloading.js';
if (process.argv.includes('--autoload'))
    await autoload();
export { Logger, Manifest, Plugin };
Logger.default.write(3, 'main.js', 'MageStash initialisation completed', true);

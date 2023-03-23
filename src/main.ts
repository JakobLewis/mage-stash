import * as Logger from './logging.js';
import * as Plugin from './plugin.js';
export { Logger, Plugin };
export * as Manifest from './manifest.js';
export * as Wisp from './wisp.js';
export * as Library from './library.js';

import fsCache from './defaults/fscache.js';

export function loadDefaults() {
    Plugin.load(fsCache);
}

Logger.default.write(3, 'main.js', `MageStash starting with args=['${process.argv.slice(2, process.argv.length).join('\', \'')}']`, true);
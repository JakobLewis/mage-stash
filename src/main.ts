import Logger from './logging.js';

export * as Wisp from './wisp.js';
export * as Plugin from './plugin.js';
export * as Strings from './strings.js'

//import FSCache from './fsCache.js';

export { Logger, /*FSCache*/ };

Logger.write(3, 'main.js', 'MageStash initialisation completed', true);
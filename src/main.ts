import * as Logger from './logging.js';

Logger.default.write(3, 'main.js', 'Starting...', true);

export * as Wisp from './wisp.js';
export * as Plugin from './plugin.js';
export * as Strings from './strings.js';

//import FSCache from './fsCache.js';

export { Logger, /*FSCache*/ };

//throw new Error('Oh no something stinky happened');

Logger.default.write(3, 'main.js', 'MageStash initialisation completed', true);
import * as Logger from './logging.js';

Logger.default.write(3, 'main.js', 'Starting...', true);

export * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
export * as Strings from './strings.js';
export * as Library from './library.js';

import Manifest from './manifest.js';

export { Logger, Manifest, Plugin };

Plugin.load(Manifest);

Logger.default.write(3, 'main.js', 'MageStash initialisation completed', true);
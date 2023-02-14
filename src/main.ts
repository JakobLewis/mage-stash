import * as Logger from './logging.js';

Logger.default.write(3, 'main.js', `Starting with args=['${process.argv.slice(2, process.argv.length).join('\', \'')}']`, true);

import * as Strings from './strings.js';

import * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
import * as Handlers from './handler.js';

import * as Library from './library.js';
Handlers.load(Library.base);

import Manifest from './manifest.js';
Plugin.load(Manifest);

import { load as autoload } from './autoloading.js';
if (process.argv.includes('--autoload')) await autoload();

export { Wisp, Strings, Plugin, Handlers, Library, Manifest, Logger };

Logger.default.write(3, 'main.js', 'MageStash initialisation completed', true);
import { existsSync, readdirSync } from 'fs';
import { isValid, load as loadPlugin } from './plugin.js';
import Logger from './logging.js';

const logger = new Logger('autoloading.js');

export async function load(): Promise<void> {
    if (!existsSync('./lib/plugins')) {
        logger.info('Could not find ./lib/plugins folder for autoloading', true);
        return;
    }

    const jsFiles = readdirSync('./lib/plugins', { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.js')).map(f => f.name);

    for (const filename of jsFiles) {
        try {
            const plugin = (await import('./plugins/' + filename)).default;
            if (isValid(plugin)) loadPlugin(plugin);
            else throw new TypeError('Plugin did not pass Plugin.isValid() test');
        } catch (e) {
            logger.descriptiveError(`Failed to load plugin './lib/plugins/${filename}': `, e);
        }
    }
}

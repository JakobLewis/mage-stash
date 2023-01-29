import Logger from './logging.js';

export interface Plugin {
    readonly name: string;

    readonly hooks: {
        readonly start?: () => void;
        readonly stop?: () => void;
    }
}

const logger = new Logger('plugin.js');

const Plugins = new Array<Plugin>();
const pluginNames = new Set<string>();

export function isValid(plugin: any): plugin is Plugin {
    return (
        typeof plugin === 'object' &&
        'name' in plugin && typeof plugin.name === 'string' &&
        'hooks' in plugin && typeof plugin.hooks === 'object' && (
            (!('start' in plugin.hooks) || typeof plugin.hooks.start === 'function') &&
            (!('stop' in plugin.hooks) || typeof plugin.hooks.stop === 'function')
        )
    );
}

export function load(plugin: Plugin): boolean {
    if (Plugins.includes(plugin)) {
        logger.warn(`Plugin<${plugin.name}> cannot be loaded more than once`);
        return false;
    }

    if (pluginNames.has(plugin.name)) {
        logger.warn(`Plugin<${plugin.name}> cannot be loaded because another plugin with the same name is already loaded`);
        return false;
    }

    if (plugin.hooks.start) {
        try {
            plugin.hooks.start();
        }
        catch (e) {
            logger.descriptiveError(`Plugin<${plugin.name}>.hooks.start() threw during loading`, e);
            return false;
        }
    }

    Plugins.push(plugin);
    pluginNames.add(plugin.name);

    logger.info(`Plugin<${plugin.name}> loaded`, true);

    return true;
}

export function remove(plugin: Plugin): boolean {
    if (!pluginNames.has(plugin.name)) {
        logger.warn(`Plugin<${plugin.name}> removal failed because no such plugin could be found`);
        return false;
    }

    const i = Plugins.indexOf(plugin);

    if (i === -1) {
        logger.error(new Error(`Plugin<${plugin.name}> passed to removePlugin() does not match loaded plugin object`));
        return false;
    }

    pluginNames.delete(plugin.name);
    Plugins.splice(i, 1)

    if (plugin.hooks.stop) {
        try { plugin.hooks.stop(); }
        catch (e) { logger.descriptiveError(`Plugin<${plugin.name}>.hooks.stop() threw during removal`, e); }
    }

    return true;
}

process.on('exit', () => {
    if (Plugins.length === 0) return;
    logger.info(`Unloading all (${Plugins.length}) plugins before exit`, true);
    logger.addPreface('    ');
    Plugins.forEach(plugin => {
        try {
            remove(plugin);
        } catch (e) {
            logger.error(`Domain<${plugin.name}> threw the following error during exit:` + Logger.parseError(e));
        }
    });
});
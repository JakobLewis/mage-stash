import EventEmitter from 'events';
import Logger from './logging.js';

export interface Plugin {
    readonly name: string;
    readonly domain: symbol;

    readonly hooks: {
        readonly start?: () => void;
        readonly stop?: () => void;
    }
}

interface PluginEvents extends EventEmitter {
    on(event: 'loadingPlugin', listener: (plugin: Plugin) => void): this;
    on(event: 'removingPlugin', listener: (plugin: Plugin) => void): this;

    emit(event: 'loadingPlugin', plugin: Plugin): boolean;
    emit(event: 'removingPlugin', plugin: Plugin): boolean;
}

type BoundDomain<T extends Plugin> = Readonly<{
    array: T[];
    validator: (plugin: Plugin) => plugin is T;
}>;

const logger = new Logger('plugin.js');

const plugins = new Array<Plugin>();
const pluginNames = new Set<string>();
const boundDomains: { [domain: symbol]: BoundDomain<any>[] } = {};

export const events: PluginEvents = new EventEmitter();

export const NoDomain = Symbol('none');

/** Don't mess with other plugins at runtime lol */
export function listAllPlugins(): Readonly<Plugin>[] {
    return [...plugins];
}

export function attachToDomain<T extends Plugin>(domain: symbol, validator: (plugin: Plugin) => plugin is T, array: T[]) {
    if (boundDomains[domain] === undefined) boundDomains[domain] = [];
    else detachFromDomain(domain, validator, array);
    boundDomains[domain]!.push({ validator, array });
    for (let i = 0, n = plugins.length; i < n; i += 1) {
        const plugin = plugins[i]!;
        if (plugin.domain === domain && validator(plugin))
            array.push(plugin);
    }
}

export function detachFromDomain(domain: symbol, validator: any, array: any): boolean {
    const boundList = boundDomains[domain];
    if (boundList === undefined) return false;
    for (let i = 0, n = boundList.length; i < n; i += 1) {
        const bound = boundList[i]!;
        if (bound.array !== array || bound.validator !== validator) continue;
        boundList.splice(i, 1);
        return true;
    }
    return false;
}

export function isValid(plugin: any): plugin is Plugin {
    return (
        typeof plugin === 'object' && plugin !== null &&
        typeof plugin.name === 'string' &&
        ['string', 'undefined'].includes(typeof plugin.handler) &&
        typeof plugin.hooks === 'object' && plugin.hooks !== null && (
            ['function', 'undefined'].includes(typeof plugin.hooks.start) &&
            ['function', 'undefined'].includes(typeof plugin.hooks.stop)
        )
    );
}

export function load(plugin: Plugin): boolean {
    if (!isValid(plugin)) return false;

    if (plugins.includes(plugin)) {
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

    plugins.push(plugin);
    pluginNames.add(plugin.name);
    if (plugin.domain in boundDomains) boundDomains[plugin.domain]!
        .filter(bound => bound.validator(plugin))
        .forEach(bound => bound.array.push(plugin));

    logger.info(`Plugin<${plugin.name}> loaded`);
    events.emit('loadingPlugin', plugin);

    return true;
}

export function remove(plugin: Plugin): boolean {

    if (!pluginNames.has(plugin.name)) {
        logger.warn(`Plugin<${plugin.name}> removal failed because no such plugin could be found`);
        return false;
    }

    const i = plugins.indexOf(plugin);

    if (i === -1) {
        logger.error(new Error(`Plugin<${plugin.name}> passed to removePlugin() does not match loaded plugin object`));
        return false;
    }

    pluginNames.delete(plugin.name);
    plugins.splice(i, 1);
    if (plugin.domain in boundDomains) boundDomains[plugin.domain]!
        .filter(bound => bound.array.includes(plugin))
        .forEach(bound => bound.array.splice(bound.array.indexOf(plugin), 1));

    if (plugin.hooks.stop) {
        try { plugin.hooks.stop(); }
        catch (e) { logger.descriptiveError(`Plugin<${plugin.name}>.hooks.stop() threw during removal`, e); }
    }

    events.emit('removingPlugin', plugin);

    return true;
}

process.on('exit', () => {
    logger.info(`Unloading all (${plugins.length}) plugins before exit`, true);
    logger.addPreface('    ');
    plugins.forEach(plugin => {
        try {
            remove(plugin);
        } catch (e) {
            logger.error(`Plugin<${plugin.name}> threw the following error during exit:` + Logger.parseError(e));
        }
    });
});
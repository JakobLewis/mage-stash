import Logger from './logging.js';
import { Plugin, events, isValid as pluginIsValid } from './plugin.js';

// TODO: Give previously loaded plugins to new Handlers

export interface Handler extends Plugin {
    readonly name: string;

    /** Called every time an owned plugin is loaded. */
    readonly add: (plugin: Plugin) => void;
    /** Called every time an owned plugin is removed during runtime. Note that this isn't called at mage-stash exit */
    readonly remove: (plugin: Plugin) => void;

    readonly hooks: {
        readonly start?: () => void;
        readonly stop?: () => void
    }
}

const logger = new Logger('handler.js');

const Handlers: { [key: Handler['name']]: Handler } = {};

export function isValid(handler: any): handler is Handler {
    return (
        pluginIsValid(handler) &&
        'add' in handler && typeof handler.add === 'function' &&
        'remove' in handler && typeof handler.remove === 'function'
    );
}


export function load(handler: Handler): boolean {

    if (handler.name in Handlers) {
        logger.warn(`Handler<${handler.name}> cannot be loaded because another handler with the same name is already loaded`);
        return false;
    }

    if (Object.values(Handlers).includes(handler)) {
        logger.warn(`Handler<${handler.name}> cannot be loaded more than once`);
        return false;
    }

    if (handler.hooks.start) {
        try {
            handler.hooks.start();
        }
        catch (e) {
            logger.descriptiveError(`Handler<${handler.name}>.hooks.start() threw during loading`, e);
            return false;
        }
    }

    Handlers[handler.name] = handler;

    logger.info(`Handler<${handler.name}> loaded`, true);

    return true;
}


export function remove(handlerName: Handler['name']): boolean {
    if (!(handlerName in Handlers)) {
        logger.warn(`Handler<${handlerName}> removal failed because no plugin with said name could be found`);
        return false;
    }

    const handler = Handlers[handlerName]!;
    delete Handlers[handlerName];

    if (handler.hooks.stop) {
        try { handler.hooks.stop(); }
        catch (e) { logger.descriptiveError(`Handler<${handler.name}>.hooks.stop() threw during removal`, e); }
    }

    return true;
}


events.on('loadingPlugin', (plugin: Plugin) => {
    if (plugin.handler === undefined) return;

    const handler = Handlers[plugin.handler];

    if (handler !== undefined) handler.add(plugin);
});

// 'beforeExit' gets called every time the event loop empties, so we need to ensure all handlers are only unloaded once
let alreadyExited = false;
process.on('beforeExit', () => {

    const allHandlers = Object.values(Handlers);
    if (allHandlers.length === 0) return;

    alreadyExited = true;

    logger.info(`Unloading all (${allHandlers.length}) handlers before exit`, true);

    for (const handler of allHandlers) {
        try {
            remove(handler.name);
        } catch (e) {
            logger.descriptiveError(`Handler<${handler.name}> threw during exit: `, e);
        }
    }
});

events.on('removingPlugin', (plugin: Plugin) => {
    if (plugin.handler === undefined || alreadyExited) return;

    const handler = Handlers[plugin.handler];

    if (handler !== undefined) handler.remove(plugin);
});
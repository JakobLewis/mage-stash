import { Plugin, isValid as pluginIsValid } from './plugin.js';
import { Wisp } from './wisp.js';
import { Handler } from './handler.js';
import Logger from './logging.js';

// TODO: Implement searching
// TODO: Implement partial/scoped search

export interface Library extends Plugin {
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
}

export function isValid(library: any): library is Library {
    return (
        pluginIsValid(library) &&
        'findWisp' in library && typeof library.findWisp === 'function' &&
        'search' in library && typeof library.search === 'function'
    );
}

const Loaded = new Array<Library>();

const logger = new Logger('library.js');

export const base: Handler = {
    name: 'Library',
    add: (plugin: Plugin) => isValid(plugin) && Loaded.push(plugin),
    remove: (plugin: Plugin) => {
        const i = Loaded.indexOf(plugin as Library);
        if (i === -1) return;
        Loaded.splice(i, 1);
    },
    hooks: {}
}

export function findWisp(uniqueIdentifier: string, fuzzy: boolean): Promise<(Wisp | undefined)[]> {
    return Promise.all(Loaded.map(library => {
        try {
            return library.findWisp(uniqueIdentifier, fuzzy)
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during scatterFindWisp: `, e);
            return undefined;
        }
    }));
}

export function search(searchTerms: string[]): Promise<(Wisp[])[]> {
    return Promise.all(Loaded.map(library => {
        try {
            return library.search(searchTerms);
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during search: `, e);
            return [];
        }
    }));
}
import * as Plugin from './plugin.js';
import { Wisp } from './wisp.js';
import Logger from './logging.js';

// TODO: Implement searching
// TODO: Implement partial/scoped search

export interface Library extends Plugin.Plugin {
    readonly domain: typeof LibrarySymbol;
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
}

export function isValid(library: Plugin.Plugin): library is Library {
    return (
        'findWisp' in library && typeof library.findWisp === 'function' &&
        'search' in library && typeof library.search === 'function'
    );
}

const loaded = new Array<Library>();
const logger = new Logger('library.js');
export const LibrarySymbol = Symbol('library');

export function findWisp(uniqueIdentifier: string, fuzzy: boolean): Promise<(Wisp | undefined)[]> {
    return Promise.all(loaded.map(async library => {
        try {
            return await library.findWisp(uniqueIdentifier, fuzzy)
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during findWisp: `, e);
            return undefined;
        }
    }));
}

export function search(searchTerms: string[]): Promise<(Wisp[])[]> {
    return Promise.all(loaded.map(async library => {
        try {
            return await library.search(searchTerms);
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during search: `, e);
            return [];
        }
    }));
}

Plugin.load({
    name: 'library',
    domain: Plugin.NoDomain,
    hooks: {
        start: () => Plugin.attachToDomain(LibrarySymbol, isValid, loaded),
        stop: () => {
            Plugin.detachFromDomain(LibrarySymbol, isValid, loaded);
            loaded.length = 0;
        }
    }
});
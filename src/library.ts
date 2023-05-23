import * as Plugin from './plugin.js';
import { Wisp, AbsolutePath } from './wisp.js';
import Logger from './logging.js';

// TODO: Implement searching
// TODO: Implement partial/scoped search

export interface Library extends Plugin.Plugin {
    readonly domain: typeof LibrarySymbol;
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
    readonly shortlist?: {
        readonly update: () => Promise<boolean> | boolean;
        readonly data: Record<string, AbsolutePath[]>;
    };
}

export function isValid(library: Plugin.Plugin): library is Library {
    return (
        'findWisp' in library && typeof library.findWisp === 'function' &&
        'search' in library && typeof library.search === 'function' &&
        (!('shortList' in library) || (typeof library.shortList === 'object' && library.shortList !== null &&
            'update' in library.shortList && typeof library.shortList.update === 'function' &&
            'data' in library.shortList && typeof library.shortList.data === 'object' && library.shortList.data !== null
        ))
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

export function updateShortlists(): Promise<boolean[]> {
    return Promise.all(loaded.map(async library => {
        try {
            return 'shortlist' in library ? await library.shortlist.update() : false;
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during shortlist update: `, e);
            return false;
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
import * as Plugin from './plugin.js';
import Logger from './logging.js';
export function isValid(library) {
    return ('findWisp' in library && typeof library.findWisp === 'function' &&
        'search' in library && typeof library.search === 'function');
}
const loaded = new Array();
const logger = new Logger('library.js');
export const LibrarySymbol = Symbol('library');
export function findWisp(uniqueIdentifier, fuzzy) {
    return Promise.all(loaded.map(async (library) => {
        try {
            return await library.findWisp(uniqueIdentifier, fuzzy);
        }
        catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during findWisp: `, e);
            return undefined;
        }
    }));
}
export function search(searchTerms) {
    return Promise.all(loaded.map(async (library) => {
        try {
            return await library.search(searchTerms);
        }
        catch (e) {
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

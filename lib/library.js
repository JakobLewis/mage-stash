import { isValid as pluginIsValid } from './plugin.js';
import Logger from './logging.js';
export function isValid(library) {
    return (pluginIsValid(library) &&
        'findWisp' in library && typeof library.findWisp === 'function' &&
        'search' in library && typeof library.search === 'function');
}
const Loaded = new Array();
const logger = new Logger('library.js');
export const base = {
    name: 'Library',
    add: (plugin) => isValid(plugin) && Loaded.push(plugin),
    remove: (plugin) => {
        const i = Loaded.indexOf(plugin);
        if (i === -1)
            return;
        Loaded.splice(i, 1);
    },
    hooks: {}
};
export function findWisp(uniqueIdentifier, fuzzy) {
    return Promise.all(Loaded.map(library => {
        try {
            return library.findWisp(uniqueIdentifier, fuzzy);
        }
        catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during scatterFindWisp: `, e);
            return undefined;
        }
    }));
}
export function search(searchTerms) {
    return Promise.all(Loaded.map(library => {
        try {
            return library.search(searchTerms);
        }
        catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during search: `, e);
            return [];
        }
    }));
}

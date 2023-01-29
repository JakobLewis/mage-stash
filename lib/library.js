import * as Plugin from './plugin.js';
import Logger from './logging.js';
const Loaded = new Array();
const logger = new Logger('library.js');
export function add(library) {
    if (!Plugin.load(library))
        return false;
    Loaded.push(library);
    return true;
}
export function list() {
    return Loaded.map(library => library.name);
}
export function findWisp(uniqueIdentifier, fuzzy) {
    return Loaded.map(library => {
        try {
            return library.findWisp(uniqueIdentifier, fuzzy);
        }
        catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during scatterFindWisp: `, e);
            return undefined;
        }
    });
}
export function search(searchTerms) {
    return Loaded.map(library => {
        try {
            return library.search(searchTerms);
        }
        catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during search: `, e);
            return [];
        }
    });
}

import * as Plugin from './plugin.js';
import { Wisp } from './wisp.js';
import Logger from './logging.js';

// TODO: Implement searching
// TODO: Implement partial/scoped search

export interface Library extends Plugin.Plugin {
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
}

const Loaded = new Array<Library>();

const logger = new Logger('library.js');

export function add(library: Library): boolean {
    if (!Plugin.load(library)) return false;
    Loaded.push(library);
    return true;
}

export function list(): string[] {
    return Loaded.map(library => library.name);
}

export function findWisp(uniqueIdentifier: string, fuzzy: boolean): ReturnType<Library['findWisp']>[] {
    return Loaded.map(library => {
        try {
            return library.findWisp(uniqueIdentifier, fuzzy)
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during scatterFindWisp: `, e);
            return undefined;
        }
    });

}

export function search(searchTerms: string[]): ReturnType<Library['search']>[] {
    return Loaded.map(library => {
        try {
            return library.search(searchTerms);
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw during search: `, e);
            return [];
        }
    });
}
import * as Plugin from './plugin.js';
import { Wisp } from './wisp.js';
import Logger from './logging.js';

export interface Library extends Plugin.Plugin {
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
}

const Loaded = new Array<Library>();

const logger = new Logger('library.js');


export function load(library: Library): boolean {
    if (Loaded.includes(library) || Loaded.map(m => m.name).includes(library.name)) {
        logger.warn(`Library<${library.name}> cannot be loaded more than once`);
        return false;
    }

    if (library.hooks.start) library.hooks.start();
    Loaded.push(library);

    logger.info(`Library<${library.name}> loaded`);

    return true;
}

export function remove(library: Library): void {
    const index = Loaded.indexOf(library);
    if (index !== -1) Loaded.splice(index, 1);
    else logger.warn(`Library<${library.name}> cannot be removed because it isn't loaded`);
}

export function list(): string[] {
    return Loaded.map(library => library.name);
}

export async function findWisp(uniqueIdentifier: string, fuzzy: boolean): Promise<Wisp | undefined> {
    const librarySnapshot = [...Loaded]; // Used to ensure Loaded changes dont break reads
    for (const library of librarySnapshot) {
        const result = await library.findWisp(uniqueIdentifier, fuzzy);
        if (result !== undefined) return result;
    }
    return undefined;
}

export function scatterFindWisp(uniqueIdentifier: string, fuzzy: boolean): ReturnType<Library['findWisp']>[] {
    return Loaded.map(library => library.findWisp(uniqueIdentifier, fuzzy));
}

export function search(searchTerms: string[]): ReturnType<Library['search']>[] {
    return Loaded.map(library => library.search(searchTerms));
}

process.on('exit', () => {
    logger.info('Unloading all libraries before exit', true);
    logger.addPreface('    ');
    Loaded.forEach(library => {
        try {
            remove(library);
        } catch (e) {
            logger.descriptiveError(`Library<${library.name}> threw the following error during exit: `, Logger.parseError(e));
        }
    });
});
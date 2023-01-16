import * as Wisp from './wisp.js';
import { Manifest } from './manifest.js';
import { compressSync, decompressSync } from './strings.js';
import Logger from './logging.js';

import { promises as fs, existsSync, mkdirSync } from 'fs';

throw new Error('fsCache.ts has not yet been implemented');

// TODO: Performance testing for different access methods
// TODO: Optimise searching via word histograms
// TODO: Optimise reads with memory tree

const storagePath = './store';

const logger = new Logger('fsCache.js');

async function readWisp<T extends Wisp.Wisp>(path: T['path']): Promise<T | undefined> {

    try {
        const compressedString = (await fs.readFile(storagePath + path)).toString();

    } catch (e) {
        if (e instanceof Error && (e as any).errno === -4068) {
            // It's a directory

        } else return undefined;
    }

    let wisp: Omit<T, 'content'> | T;

    try {
        wisp = { path, ...JSON.parse(decompressSync(fileContents)) };
        if ('content' in wisp) return wisp;
    } catch (e) {
        logger.descriptiveError(`Wisp<${path}> threw while decompressing or JSON parsing: `, e);
        return undefined;
    }

    try {
        return {
            ...wisp,
            content: (await fs.readdir(storagePath + path + '.children')).filter(Wisp.isValidLocalID)
        } as T;
    } catch (e) {
        logger.descriptiveError(`GroupWisp<${path}> threw while reading content directory: `, e);
        return undefined;
    }
}

async function writeWisp(wisp: Wisp.Wisp): Promise<boolean | never> {

    const { path, content, metadata } = wisp;
    const writePath = storagePath + path;

    if (typeof content === 'object') {

        await fs.writeFile(writePath, JSON.stringify({ metadata }));

        try {
            await fs.mkdir(writePath + '.children');
        } catch (e) {
            if (!(e instanceof Error) || !((e as any).errno === '-4075' && (e as any).syscall === 'mkdir')) throw e;
        }

    } else {
        await fs.writeFile(writePath, compressSync(JSON.stringify({ content, metadata })));
    }

    try {
        if (typeof content === 'object') {

        } else {

        }

    } catch (e) {
        // Ignore folder-already-exists errors when we try and overwrite the 

    }
    if (typeof content === 'object') {

        try {
            const writePromise =

                await writePromise;
            return true;
        } catch { }


    } else {
        try {

            return true;
        } catch (e) {

            logger.error(e);
            return false;
        }
    }
}

async function deleteWisp(wispUID: Wisp.Wisp['path']): Promise<boolean> {
    try {
        await Promise.all([
            fs.rm(storagePath + wispUID, { force: true }),
            fs.rm(storagePath + wispUID + '.children', { force: true, recursive: true })
        ]);
        return true;
    } catch (e) {
        logger.descriptiveError(`Error while deleting Wisp<${wispUID}>: `, e);
        return false;
    }
}

async function search() {
    return [];
}

/*
async function search(searchStrings: string[], startPath: string = '', withGroupGiven?: Wisp.GroupWisp) {
    const rootWisp = withGroupGiven ? withGroupGiven : await findWispByUID(startPath);
    if (rootWisp === undefined) return [];

    const matches = new Array<Wisp.Wisp>();

    if (withGroupGiven === undefined && Wisp.searchFor(rootWisp, searchStrings)) matches.push(rootWisp);

    if (Array.isArray(rootWisp.content)) {

        let childUids = rootWisp.content as string[];
        if (startPath.length > 0) childUids = childUids.map(id => startPath + '/' + id);

        const childWisps = await Promise.all(childUids.map(findWispByUID));
        const childGroups = new Array<Wisp.GroupWisp>();

        for (const wisp of childWisps) {
            if (wisp === undefined) continue;

            if (Array.isArray(wisp.content)) childGroups.push(wisp as Wisp.GroupWisp);
            if (Wisp.searchFor(wisp, searchStrings)) matches.push(wisp);
        }

        for (const groupWisp of childGroups) {
            matches.push(...await search(searchStrings, groupWisp.path + '/' + groupWisp.id, groupWisp));
        }
    }

    return matches;
}*/

const fsCache: Manifest = {
    name: 'fsCache',
    hooks: {
        start: () => existsSync(storagePath) ? null : mkdirSync(storagePath)
    },
    writeWisp,
    deleteWisp,
    readWisp
};

export default fsCache;
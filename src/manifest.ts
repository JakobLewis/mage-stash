import * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
import { compressSync, decompressSync } from './strings.js';
import Logger from './logging.js';

import { promises as fs, existsSync, mkdirSync } from 'fs';


export interface Manifest extends Plugin.Plugin {
    readonly readWisp: <T extends Wisp.Wisp['path']>(path: T) => Promise<Wisp.Wisp<T> | undefined> | Wisp.Wisp<T> | undefined;
    readonly writeWisp: (wisp: Wisp.Wisp) => Promise<boolean> | boolean;
    readonly deleteWisp: (path: Wisp.Wisp['path']) => Promise<boolean> | boolean;
}

type StoredContentWisp = Omit<Wisp.ContentWisp, 'path'>;

const storagePath = './store';

const logger = new Logger('manifest.js');

async function readWisp<T extends Wisp.Wisp['path']>(path: T): Promise<Wisp.Wisp<T> | undefined> {
    if (!Wisp.isValidPath(path)) throw new Wisp.MalformedPathError(path);

    try { // Assume Wisp<T> is a ContentWisp
        const compressedString = (await fs.readFile(storagePath + path)).toString();
        const decompressedString = decompressSync(compressedString);
        const wisp = JSON.parse(decompressedString) as StoredContentWisp;
        return { ...wisp, path }
    } catch (e) {
        // EISDIR code signifies that we tried to read a directory
        if (!(e instanceof Error && 'code' in e && e.code === 'EISDIR')) {
            logger.descriptiveError(`Manifest.readWisp('${path}') threw: `, e);
            return undefined;
        }

        try {
            const files = await fs.readdir(storagePath + path);
            if (!files.includes('metadata.json')) return undefined;

            const readPromise = fs.readFile(storagePath + path + '/metadata.json');
            const content = files.filter(Wisp.isValidLocalID);
            const metadata = JSON.parse((await readPromise).toString());

            return {
                path, content, metadata
            };

        } catch (e2) {
            logger.descriptiveError(`Manifest.readWisp('${path}') threw: `, e2);
            return undefined;
        }
    }
}

async function writeWisp(wisp: Wisp.Wisp): Promise<boolean> {
    // Very clunky, inefficient. Needs write-queue before type-caching can be used for faster reads

    try {
        Wisp.assertIsValid(wisp);
    } catch (e) {
        logger.warn(`writeWisp ` + Logger.parseError(e));
        return false;
    }

    const { path, content, metadata } = wisp;
    const writePath = storagePath + path;

    try {
        if (typeof content === 'object') {
            try {
                await fs.mkdir(writePath);
            } catch (e) {
                if (!(e instanceof Error) || !((e as any).code === 'EEXIST' && (e as any).syscall === 'mkdir')) {
                    logger.descriptiveError(`GroupWisp<${path}> directory creation failed: `, e);
                    return false;
                }
            }

            await fs.writeFile(writePath + '/metadata.json', JSON.stringify(metadata));

        } else await fs.writeFile(writePath, compressSync(JSON.stringify({ content, metadata })));
    } catch {
        return false;
    }

    return true;
}

async function deleteWisp(path: Wisp.Wisp['path']): Promise<boolean> {
    if (!Wisp.isValidPath(path)) throw new Wisp.MalformedPathError(path);

    try {
        await Promise.all([
            fs.rm(storagePath + path, { force: true, recursive: true }),
        ]);
        return true;
    } catch (e) {
        logger.descriptiveError(`Error while deleting Wisp<${path}>: `, e);
        return false;
    }
}

const manifest: Manifest = {
    name: 'Manifest',
    hooks: {
        start: () => existsSync(storagePath) ? null : mkdirSync(storagePath)
    },
    writeWisp,
    deleteWisp,
    readWisp
};

export default manifest;
import * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
import Logger from './logging.js';

export interface Manifest extends Plugin.Plugin {
    readonly readWisp: <T extends Wisp.Wisp['path']>(path: T) => Promise<Wisp.Wisp<T> | undefined> | Wisp.Wisp<T> | undefined;
    readonly writeWisp: (wisp: Wisp.Wisp) => Promise<boolean> | boolean;
    readonly deleteWisp: (path: Wisp.Wisp['path']) => Promise<boolean> | boolean;
}

type QueuedItem = Readonly<{
    path: Wisp.AbsolutePath,
    promise: Promise<any>,
    resolve: () => void
}>;

export const ManifestSymbol = Symbol('manifest');

const logger = new Logger('manifest.js');
const loaded = new Array<Manifest>();
const accessQueue = new Array<QueuedItem>();

async function lock(path: Wisp.AbsolutePath): Promise<QueuedItem> {
    let resolve: () => void;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve as unknown as typeof resolve;
    }) as Promise<void>;

    // @ts-expect-error
    const wispLock = { promise, path, resolve };
    const dependents = Promise.allSettled(accessQueue.filter(item => {
        const otherPath = item.path;
        return path.length > otherPath.length ? path.startsWith(otherPath) : otherPath.startsWith(path)
    }).map(x => x.promise));

    accessQueue.push(wispLock);
    await dependents;

    return wispLock;
}

function unlock(wispLock: QueuedItem): void {
    accessQueue.splice(accessQueue.indexOf(wispLock), 1);
    wispLock.resolve();
}

function isValid(manifest: Plugin.Plugin): manifest is Manifest {
    return (
        'readWisp' in manifest && typeof manifest.readWisp === 'function' &&
        'writeWisp' in manifest && typeof manifest.readWisp === 'function' &&
        'deleteWisp' in manifest && typeof manifest.readWisp === 'function'
    );
}

export function count(): number {
    return loaded.length;
}

export async function readWisp<T extends Wisp.Wisp['path']>(path: T): Promise<(Wisp.Wisp<T> | undefined)> {
    if (!Wisp.isValidPath(path)) throw new Wisp.MalformedPathError(path);

    const wispLock = await lock(path);
    // Note: for .. of and [...loaded] are not used to ensure unloaded plugins arent called
    // Worst case scenario a manifest is missed
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i]!;
        try {
            const result = await manifest.readWisp(path);
            if (result !== undefined) {
                if (result.path !== path) throw new TypeError(`Returned Wisp<${result.path}> while reading Wisp<${path}>`);

                unlock(wispLock);
                return result;
            }

        } catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during read: `, e);
        }
    }

    unlock(wispLock);
    return undefined;
}

export async function readWispAll<T extends Wisp.Wisp['path']>(path: T): Promise<(Wisp.Wisp<T> | undefined)[]> {
    if (!Wisp.isValidPath(path)) throw new Wisp.MalformedPathError(path);

    const wispLock = await lock(path);
    // Note: for .. of and [...loaded] are not used to ensure unloaded plugins arent called
    // Worst case scenario a manifest is missed
    const results = new Array<Awaited<ReturnType<Manifest['readWisp']>>>(loaded.length);
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i]!;
        try {
            const result = await manifest.readWisp(path);
            if (result && result.path !== path)
                throw new TypeError(`Returned Wisp<${result.path}> while reading Wisp<${path}>`);
            results[i] = result;
        } catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during read: `, e);
            results[i] = undefined;
        }
    }

    unlock(wispLock);
    return results as (Wisp.Wisp<T> | undefined)[];
}

export async function writeWisp(wisp: Wisp.Wisp): Promise<boolean[]> {
    Wisp.assertIsValid(wisp);

    const wispLock = await lock(wisp.path);
    const results = new Array<Awaited<ReturnType<Manifest['writeWisp']>>>(loaded.length);
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i]!;
        try {
            results[i] = await manifest.writeWisp(wisp);
        } catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during write: `, e);
            results[i] = false;
        }
    }

    unlock(wispLock);
    return results;
}

export async function deleteWisp(path: Wisp.Wisp['path']): Promise<boolean[]> {
    if (!Wisp.isValidPath(path)) throw new Wisp.MalformedPathError(path)

    const wispLock = await lock(path);
    // Note: for .. of and [...loaded] are not used to ensure unloaded plugins arent called
    // Worst case scenario a manifest is missed
    const results = new Array<Awaited<ReturnType<Manifest['deleteWisp']>>>(loaded.length);
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i]!;
        try {
            results[i] = await manifest.deleteWisp(path);
        } catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during delete: `, e);
            results[i] = false;
        }
    }

    unlock(wispLock);
    return results;
}

Plugin.load({
    name: 'manifest',
    domain: Plugin.NoDomain,
    hooks: {
        start: () => Plugin.attachToDomain(ManifestSymbol, isValid, loaded),
        stop: () => {
            Plugin.detachFromDomain(ManifestSymbol, isValid, loaded);
            loaded.length = 0;
        }
    }
});
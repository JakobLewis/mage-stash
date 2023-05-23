import * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
import Logger from './logging.js';
export const ManifestSymbol = Symbol('manifest');
const logger = new Logger('manifest.js');
const loaded = new Array();
const accessQueue = new Array();
async function lock(path) {
    let resolve;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
    });
    // @ts-expect-error
    const wispLock = { promise, path, resolve };
    const dependents = Promise.allSettled(accessQueue.filter(item => {
        const otherPath = item.path;
        return path.length > otherPath.length ? path.startsWith(otherPath) : otherPath.startsWith(path);
    }).map(x => x.promise));
    accessQueue.push(wispLock);
    await dependents;
    return wispLock;
}
function unlock(wispLock) {
    accessQueue.splice(accessQueue.indexOf(wispLock), 1);
    wispLock.resolve();
}
function isValid(manifest) {
    return ('readWisp' in manifest && typeof manifest.readWisp === 'function' &&
        'writeWisp' in manifest && typeof manifest.readWisp === 'function' &&
        'deleteWisp' in manifest && typeof manifest.readWisp === 'function');
}
export function count() {
    return loaded.length;
}
export async function readWisp(path) {
    if (!Wisp.isValidPath(path))
        throw new Wisp.MalformedPathError(path);
    const wispLock = await lock(path);
    // Note: for .. of and [...loaded] are not used to ensure unloaded plugins arent called
    // Worst case scenario a manifest is missed
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i];
        try {
            const result = await manifest.readWisp(path);
            if (result !== undefined) {
                if (result.path !== path)
                    throw new TypeError(`Returned Wisp<${result.path}> while reading Wisp<${path}>`);
                unlock(wispLock);
                return result;
            }
        }
        catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during read: `, e);
        }
    }
    unlock(wispLock);
    return undefined;
}
export async function readWispAll(path) {
    if (!Wisp.isValidPath(path))
        throw new Wisp.MalformedPathError(path);
    const wispLock = await lock(path);
    // Note: for .. of and [...loaded] are not used to ensure unloaded plugins arent called
    // Worst case scenario a manifest is missed
    const results = new Array(loaded.length);
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i];
        try {
            const result = await manifest.readWisp(path);
            if (result && result.path !== path)
                throw new TypeError(`Returned Wisp<${result.path}> while reading Wisp<${path}>`);
            results[i] = result;
        }
        catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during read: `, e);
            results[i] = undefined;
        }
    }
    unlock(wispLock);
    return results;
}
export async function writeWisp(wisp) {
    Wisp.assertIsValid(wisp);
    const wispLock = await lock(wisp.path);
    const results = new Array(loaded.length);
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i];
        try {
            results[i] = await manifest.writeWisp(wisp);
        }
        catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during write: `, e);
            results[i] = false;
        }
    }
    unlock(wispLock);
    return results;
}
export async function deleteWisp(path) {
    if (!Wisp.isValidPath(path))
        throw new Wisp.MalformedPathError(path);
    const wispLock = await lock(path);
    // Note: for .. of and [...loaded] are not used to ensure unloaded plugins arent called
    // Worst case scenario a manifest is missed
    const results = new Array(loaded.length);
    for (let i = 0; i < loaded.length; i += 1) {
        const manifest = loaded[i];
        try {
            results[i] = await manifest.deleteWisp(path);
        }
        catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during delete: `, e);
            results[i] = false;
        }
    }
    unlock(wispLock);
    return results;
}
export async function* walk(path) {
    const groupBreadcrumbs = new Array();
    const first = await readWisp(path);
    if (first === undefined)
        return;
    else if (Wisp.isGroupType(first))
        groupBreadcrumbs.push(first);
    yield first;
    while (groupBreadcrumbs.length > 0) {
        const { path, content } = groupBreadcrumbs[groupBreadcrumbs.length - 1];
        groupBreadcrumbs.pop();
        for (const child of content) {
            const childWisp = await readWisp(`${path}/${child}`);
            if (childWisp === undefined)
                continue;
            yield childWisp;
            if (Wisp.isGroupType(childWisp))
                groupBreadcrumbs.push(childWisp);
        }
    }
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

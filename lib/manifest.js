import * as Plugin from './plugin.js';
import { isValidPath, assertIsValid, MalformedPathError } from './wisp.js';
import Logger from './logging.js';
export class MismatchedResultError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "MismatchedResultError";
    }
}
const Loaded = new Array();
export function add(manifest) {
    if (!Plugin.load(manifest))
        return false;
    Loaded.push(manifest);
    return true;
}
const logger = new Logger('manifest.js');
const pendingWisps = {};
const memoryCache = {};
const timeouts = {};
function cleanCache() {
    const now = Date.now();
    for (const key in timeouts)
        if (timeouts[key] + 10000 < now)
            delete timeouts[key];
}
setInterval(cleanCache, 10000).unref();
async function read(path) {
    const manifestSnapshot = [...Loaded]; // Used to ensure Loaded changes dont break reads
    for (const manifest of manifestSnapshot) {
        try {
            const result = await manifest.readWisp(path);
            if (result !== undefined) {
                if (result.path === path)
                    return result;
                else
                    logger.error(new MismatchedResultError(`Manifest<${manifest.name}> returned Wisp<${result.path}> when requesting Wisp<${path}>`));
            }
        }
        catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}>.readWisp('${path}') threw: `, e);
        }
    }
    return undefined;
}
export async function readWisp(path) {
    if (!isValidPath(path)) {
        logger.error(new MalformedPathError(path));
        return undefined;
    }
    // Check memory cache; updates timeout and returns on success
    if (path in memoryCache) {
        timeouts[path] = Date.now();
        return memoryCache[path];
    }
    // Check to see if another async process has already started loading the wisp
    if (path in pendingWisps)
        return await pendingWisps[path];
    // Start promise and place it in the pending section
    const readPromise = read(path);
    pendingWisps[path] = readPromise;
    const finalResult = await readPromise;
    // Remove from pending area
    delete pendingWisps[path];
    // Cache result; even failures
    memoryCache[path] = finalResult;
    timeouts[path] = Date.now();
    return finalResult;
}
export function writeWisp(wisp) {
    try {
        assertIsValid(wisp);
    }
    catch (e) {
        logger.error(e);
        return [];
    }
    const writeOperations = Loaded.map(manifest => {
        try {
            return manifest.writeWisp(wisp);
        }
        catch (e) {
            logger.error(e);
            return false;
        }
    });
    return Promise.all(writeOperations);
}
export function deleteWisp(path) {
    if (!isValidPath(path)) {
        logger.error(new MalformedPathError(path));
        return [];
    }
    ;
    if (path in memoryCache) {
        delete memoryCache[path];
        delete timeouts[path];
    }
    return Loaded.map(manifest => manifest.deleteWisp(path));
}
/* TODO: Make lock class that 'owns' write access to a wisp and all its children
        -> internal deferred promise 'aquire' queue for async/await ergonomics
        -> track read/write/delete calls on locks
        -> expire locks that havent been used for a while
        -> use locks as pseudo-memory-caches for write/delete/read calls

    Current implementation allows following behavior, tldr; cannot guarantee parent Wisp exists before attempting write
        Async Process 1 -> creates read promise to ensure GroupWisp exists
        Async Process 2 -> creates promise to delete GroupWisp
        Async Process 1 -> read promise resolves, GroupWisp currently exists
        Async Process 1 -> creates write promise for new child wisp underneath GroupWisp
        Async Process 2 -> delete promise resolves, GroupWisp is deleted
        Async Process 1 -> write promise fails, GroupWisp does not exist
        

interface DeferredPromise<Input, Result> {
    resolve: (result: Result) => void;
    reject: (error: Error) => void;
    data: Input;
}

const activeLocks: Record<string, WriteLock> = {};

function lockCanBeActivated(path: string): boolean {
    for (const lock of Object.keys(activeLocks)) {
        if (path.length > lock.length ? path.startsWith(lock) : lock.startsWith(path)) return false;
    }
    return true;
}

export class InvalidLockError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "InvalidLockError";
    }
}

export class WriteLock {
    private wispPath: string;

    get isValid(): boolean {
        return activeLocks[this.wispPath] === this
    }

    get path(): string {
        return this.wispPath;
    }

    constructor(path: string) {
        this.wispPath = path;
    }

    request(): boolean {
        if (this.isValid) return true;
        else if (lockCanBeActivated(this.wispPath)) {
            activeLocks[this.wispPath] = this;
            return true;
        } else return false;
    }

    release(): void {
        delete activeLocks[this.wispPath];
    }

    write(wisp: Wisp): ReturnType<Manifest['writeWisp']>[] {
        if (!this.isValid) throw new InvalidLockError("Lock is not active and cannot be written to");
        return Loaded.map(manifest => manifest.writeWisp(wisp));
    }

    delete(path: Wisp['path']): ReturnType<Manifest['deleteWisp']>[] {
        return Loaded.map(manifest => manifest.deleteWisp(path));
    }
}
*/ 

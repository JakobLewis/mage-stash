import * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
import Logger from './logging.js';

export interface Manifest extends Plugin.Plugin {
    readonly readWisp: <T extends Wisp.Wisp['path']>(path: T) => Promise<Wisp.Wisp<T> | undefined> | Wisp.Wisp<T> | undefined;
    readonly writeWisp: (wisp: Wisp.Wisp) => Promise<boolean> | boolean;
    readonly deleteWisp: (path: Wisp.Wisp['path']) => Promise<boolean> | boolean;
}

export const ManifestSymbol = Symbol('manifest');
const logger = new Logger('manifest.js');
const loaded = new Array<Manifest>();

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

export function readWisp<T extends Wisp.Wisp['path']>(path: T): Promise<(Wisp.Wisp<T> | undefined)[]> | (Wisp.Wisp<T> | undefined)[] {
    return Promise.all(loaded.map(async manifest => {
        try {
            return await manifest.readWisp(path);
        } catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during read: `, e);
            return undefined;
        }
    }));
}

export function writeWisp(wisp: Wisp.Wisp): Promise<boolean[]> | boolean[] {
    return Promise.all(loaded.map(async manifest => {
        try {
            return await manifest.writeWisp(wisp);
        } catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during write: `, e);
            return false;
        }
    }));
}

export function deleteWisp(path: Wisp.Wisp['path']): Promise<boolean[]> | boolean[] {
    return Promise.all(loaded.map(async manifest => {
        try {
            return await manifest.deleteWisp(path);
        } catch (e) {
            logger.descriptiveError(`Manifest<${manifest.name}> threw during delete: `, e);
            return false;
        }
    }));
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
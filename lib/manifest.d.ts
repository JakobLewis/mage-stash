import * as Plugin from './plugin.js';
import { Wisp } from './wisp.js';
export interface Manifest extends Plugin.Plugin {
    readonly readWisp: (path: Wisp['path']) => Promise<Wisp | undefined | never> | Wisp | undefined | never;
    readonly writeWisp: (wisp: Wisp) => Promise<true | never> | true | never;
    readonly deleteWisp: (path: Wisp['path']) => Promise<true | never> | true | never;
}
export declare class MismatchedResultError extends Error {
    constructor(msg: string);
}
export declare function add(manifest: Manifest): boolean;
export declare function readWisp<T extends Wisp['path']>(path: T): Promise<Wisp<T> | undefined>;
export declare function writeWisp(wisp: Wisp): Promise<boolean[]> | [];
export declare function deleteWisp(path: Wisp['path']): ReturnType<Manifest['deleteWisp']>[];

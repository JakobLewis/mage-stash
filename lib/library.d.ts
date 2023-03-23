import * as Plugin from './plugin.js';
import { Wisp } from './wisp.js';
export interface Library extends Plugin.Plugin {
    readonly domain: typeof LibrarySymbol;
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
}
export declare function isValid(library: Plugin.Plugin): library is Library;
export declare const LibrarySymbol: unique symbol;
export declare function findWisp(uniqueIdentifier: string, fuzzy: boolean): Promise<(Wisp | undefined)[]>;
export declare function search(searchTerms: string[]): Promise<(Wisp[])[]>;

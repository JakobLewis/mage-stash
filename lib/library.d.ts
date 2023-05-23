import * as Plugin from './plugin.js';
import { Wisp, AbsolutePath } from './wisp.js';
export interface Library extends Plugin.Plugin {
    readonly domain: typeof LibrarySymbol;
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
    readonly shortlist?: {
        readonly update: () => Promise<boolean> | boolean;
        readonly data: Record<string, AbsolutePath[]>;
    };
}
export declare function isValid(library: Plugin.Plugin): library is Library;
export declare const LibrarySymbol: unique symbol;
export declare function findWisp(uniqueIdentifier: string, fuzzy: boolean): Promise<(Wisp | undefined)[]>;
export declare function search(searchTerms: string[]): Promise<(Wisp[])[]>;
export declare function updateShortlists(): Promise<boolean[]>;

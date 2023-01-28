import * as Plugin from './plugin.js';
import { Wisp } from './wisp.js';
export interface Library extends Plugin.Plugin {
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
}
export declare function add(library: Library): boolean;
export declare function list(): string[];
export declare function findWisp(uniqueIdentifier: string, fuzzy: boolean): Promise<Wisp | undefined>;
export declare function scatterFindWisp(uniqueIdentifier: string, fuzzy: boolean): ReturnType<Library['findWisp']>[];
export declare function search(searchTerms: string[]): ReturnType<Library['search']>[];

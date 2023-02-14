import { Plugin } from './plugin.js';
import { Wisp } from './wisp.js';
import { Handler } from './handler.js';
export interface Library extends Plugin {
    readonly findWisp: (uniqueIdentifier: string, fuzzy: boolean) => Promise<Wisp | undefined> | Wisp | undefined;
    readonly search: (searchTerms: string[]) => Promise<Wisp[]> | Wisp[];
}
export declare function isValid(library: any): library is Library;
export declare const base: Handler;
export declare function findWisp(uniqueIdentifier: string, fuzzy: boolean): Promise<(Wisp | undefined)[]>;
export declare function search(searchTerms: string[]): Promise<(Wisp[])[]>;

export type NotObject = string | number | boolean | undefined;
type ShallowObject = NotObject | Array<NotObject>;
export type LocalWispID = string;
export type AbsolutePath = `/${string}`;
/**
 * TODO
 */
export interface Wisp<T extends string = string> {
    /** Unique path. See absolutePathExpression for formatting rules */
    readonly path: `/${T}`;
    readonly content: string | LocalWispID[];
    /** Optional field describing both this Wisp and all of its child wisps. */
    readonly metadata?: Readonly<{
        title?: string;
        coverImg?: string;
        desc?: string;
        displayHint?: 'html' | 'md';
        /** Timestamp of last content modification. */
        lastChanged?: EpochTimeStamp;
        /** Content order */
        sequenceNumber?: number;
        /** Applicable tags. TODO: Tag standards */
        tags?: string[];
        /** Manually disable automatic content updates */
        disableAutoRefresh?: true;
        [key: string]: Readonly<ShallowObject>;
    }>;
}
export type GroupWisp = Wisp & {
    content: string[];
};
export type ContentWisp = Wisp & {
    content: string;
};
export type IncompleteWisp = Partial<{
    -readonly [K in keyof Wisp]: Wisp[K];
}>;
/** Thrown when a wisp is missing fields and/or has invalid field contents, such as a malformed path string. */
export declare class MalformedWispError extends Error {
    constructor(msg: string);
}
export declare class MalformedPathError extends Error {
    constructor(path: any);
}
/** TODO */
export declare function isContentType(wisp: Wisp): wisp is ContentWisp;
/** TODO */
export declare function isGroupType(wisp: Wisp): wisp is GroupWisp;
/** Checks whether a wisp path is valid using **idExp**. */
export declare function isValidPath(path: any): path is Wisp['path'];
export declare function isValidLocalID(id: any): id is LocalWispID;
/** TODO */
export declare function isValidContent(content: any): content is Wisp['content'];
/** TODO */
export declare function isValidMetadata(metadata: any): metadata is Wisp['metadata'];
/** Returns true if **wisp** is a valid Wisp, throws MalformedWispError or MalformedPathError otherwise.
 * See **isValidId**, **isValidPath**, **isValidContent** and **isValidMetadata** for criteria. */
export declare function assertIsValid<T extends any>(wisp: T): T extends Wisp ? true : never;
export declare function localId(path: Wisp['path']): string;
/** Returns **true** if the given wisp includes any of the search terms, otherwise returns **false**. */
export declare function searchFor(wisp: Wisp, searchTerms: string[]): boolean;
export {};

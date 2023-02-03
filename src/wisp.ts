import { normalize } from 'path';

// TODO: Better comments + remove bolded symbols
// TODO: Create better standard for searchThis + optimisation
// TODO: Wisp as a class

export type NotObject = string | number | boolean | undefined;
type ShallowObject = NotObject | Array<NotObject>;

export type LocalWispID = string;
export type AbsolutePath = `/${string}`;

/**
 * TODO
 */
export interface Wisp<T extends AbsolutePath = AbsolutePath> {
    /** Unique path. See absolutePathExpression for formatting rules */
    readonly path: T;
    readonly content: string | LocalWispID[];
    /** Optional field describing both this Wisp and all of its child wisps. */
    readonly metadata: Readonly<{
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

export type GroupWisp<T extends AbsolutePath = AbsolutePath> = Wisp<T> & { content: string[] };
export type ContentWisp<T extends AbsolutePath = AbsolutePath> = Wisp<T> & { content: string };

export type IncompleteWisp = Partial<{
    -readonly [K in keyof Wisp]: Wisp[K];
}>;

/** Thrown when a wisp is missing fields and/or has invalid field contents, such as a malformed path string. */
export class MalformedWispError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "MalformedWispError";
    }
}

export class MalformedPathError extends Error {
    constructor(path: any) {
        super(String(path));
        this.name = 'MalformedPathError';
    }
}

/** TODO */
export function isContentType(wisp: Wisp): wisp is ContentWisp {
    return typeof wisp.content === 'string';
}

/** TODO */
export function isGroupType(wisp: Wisp): wisp is GroupWisp {
    return Array.isArray(wisp.content);
}

/** Links a child wisp to a parent wisp. If the child wisp already has a path, throws **MalformedWispError**. */

// export function linkToParent<T extends Omit<Wisp, 'path'>, K extends GroupWisp>(child: T, parent: K): T & { path: WispUID<K> } {
//     if ('path' in child) throw new MalformedWispError(`Wisp<${composeUID(child as Wisp)}> was not linked to parent Wisp<${composeUID(parent)}> because it already has a parent`);
//     const completedWisp = { ...child, path: composeUID(parent) };
//     if (!parent.content.includes(child.id)) parent.content.push(child.id);
//     return completedWisp;
// }

/** Exclude all characters in a string that aren't alphanumeric, the underscore (_) character or a forward-slash (/). String cannot end with a forward-slash. */
const absolutePathExpression = new RegExp('^/[a-zA-Z0-9_\/]+[a-zA-Z0-9_]$');
/** Exclude all characters in a string that aren't alphanumeric or the underscore (_) character. */
const localPathExpression = new RegExp('^[a-zA-Z0-9_]$');

/** Checks whether a wisp path is valid using **idExp**. */
export function isValidPath(path: any): path is Wisp['path'] {
    if (typeof path !== 'string') return false;
    if (normalize(path).replace('\\', '/') !== path) return false;
    return absolutePathExpression.test(path);
}

export function isValidLocalID(id: any): id is LocalWispID {
    return typeof id === 'string' && localPathExpression.test(id);
}

/** TODO */
export function isValidContent(content: any): content is Wisp['content'] {
    return typeof content === 'string' || (Array.isArray(content) && content.length === content.filter(isValidLocalID).length);
}

/** TODO */
export function isValidMetadata(metadata: any): metadata is Wisp['metadata'] {
    if (metadata === undefined) return true;
    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) return false;

    // Ensure members are either not objects or shallow arrays
    for (const value of Object.values(metadata)) {
        if (
            typeof value === 'object' && (
                !Array.isArray(value) ||
                value.filter(arrItem => typeof arrItem === 'object').length > 0
            )
        ) return false;
    }

    return true;
}


/** Returns true if **wisp** is a valid Wisp, throws MalformedWispError or MalformedPathError otherwise.
 * See **isValidId**, **isValidPath**, **isValidContent** and **isValidMetadata** for criteria. */
export function assertIsValid<T extends any>(wisp: T): T extends Wisp ? true : never {
    if (typeof wisp !== 'object' || wisp === null) throw new MalformedWispError(`Type ${String(wisp)} is not compatable with the Wisp interface`);

    if (!('path' in wisp) || !isValidPath(wisp['path'])) throw new MalformedPathError((wisp as any)['path']);
    if (!('content' in wisp) || !isValidContent(wisp['content'])) throw new MalformedWispError(`Wisp<${(wisp as any)['path']}> has invalid content field with type "${typeof (wisp as any)['content']}"`);
    if ('metadata' in wisp && !isValidMetadata(wisp['metadata'])) throw new MalformedWispError(`Wisp<${(wisp as any)['path']}> has invalid metadata field with type "${typeof (wisp as any)['metadata']}"`);

    return true as T extends Wisp ? true : never;
}

export function localId(path: Wisp['path']): string {
    return path.slice(path.lastIndexOf('/') + 1, path.length);
}

/** Returns **true** if the given wisp includes any of the search terms, otherwise returns **false**. */
export function searchFor(wisp: Wisp, searchTerms: string[]): boolean {
    const metadataAsString = wisp.metadata ? JSON.stringify(wisp.metadata) : '';

    for (const term of searchTerms) {
        if (
            localId(wisp.path).includes(term) ||
            metadataAsString.includes(term)
        ) return true;
    }

    if (isContentType(wisp)) {
        for (const term of searchTerms) {
            if (wisp.content.includes(term)) return true;
        }
    }

    return false;
}
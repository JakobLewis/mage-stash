import { normalize } from 'path';
/** Thrown when a wisp is missing fields and/or has invalid field contents, such as a malformed path string. */
export class MalformedWispError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "MalformedWispError";
    }
}
export class MalformedPathError extends Error {
    constructor(path) {
        super(String(path));
        this.name = 'MalformedPathError';
    }
}
/** TODO */
export function isContentType(wisp) {
    return typeof wisp.content === 'string';
}
/** TODO */
export function isGroupType(wisp) {
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
export function isValidPath(path) {
    if (typeof path !== 'string')
        return false;
    if (normalize(path) !== path)
        return false;
    return absolutePathExpression.test(path);
}
export function isValidLocalID(id) {
    return typeof id === 'string' && localPathExpression.test(id);
}
/** TODO */
export function isValidContent(content) {
    return typeof content === 'string' || (Array.isArray(content) && content.length === content.filter(isValidLocalID).length);
}
/** TODO */
export function isValidMetadata(metadata) {
    if (metadata === undefined)
        return true;
    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata))
        return false;
    // Ensure members are either not objects or shallow arrays
    for (const value of Object.values(metadata)) {
        if (typeof value === 'object' && (!Array.isArray(value) ||
            value.filter(arrItem => typeof arrItem === 'object').length > 0))
            return false;
    }
    return true;
}
/** Returns true if **wisp** is a valid Wisp, throws MalformedWispError or MalformedPathError otherwise.
 * See **isValidId**, **isValidPath**, **isValidContent** and **isValidMetadata** for criteria. */
export function assertIsValid(wisp) {
    if (typeof wisp !== 'object' || wisp === null)
        throw new MalformedWispError(`Type ${String(wisp)} is not compatable with the Wisp interface`);
    if (!('path' in wisp) || !isValidPath(wisp['path']))
        throw new MalformedPathError(wisp['path']);
    if (!('content' in wisp) || !isValidContent(wisp['content']))
        throw new MalformedWispError(`Wisp<${wisp['path']}> has invalid content field with type "${typeof wisp['content']}"`);
    if ('metadata' in wisp && !isValidMetadata(wisp['metadata']))
        throw new MalformedWispError(`Wisp<${wisp['path']}> has invalid metadata field with type "${typeof wisp['metadata']}"`);
    return true;
}
export function localId(path) {
    return path.slice(path.lastIndexOf('/') + 1, path.length);
}
/** Returns **true** if the given wisp includes any of the search terms, otherwise returns **false**. */
export function searchFor(wisp, searchTerms) {
    const metadataAsString = wisp.metadata ? JSON.stringify(wisp.metadata) : '';
    for (const term of searchTerms) {
        if (localId(wisp.path).includes(term) ||
            metadataAsString.includes(term))
            return true;
    }
    if (isContentType(wisp)) {
        for (const term of searchTerms) {
            if (wisp.content.includes(term))
                return true;
        }
    }
    return false;
}

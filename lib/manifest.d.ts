import * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
export interface Manifest extends Plugin.Plugin {
    readonly readWisp: <T extends Wisp.Wisp['path']>(path: T) => Promise<Wisp.Wisp<T> | undefined> | Wisp.Wisp<T> | undefined;
    readonly writeWisp: (wisp: Wisp.Wisp) => Promise<boolean> | boolean;
    readonly deleteWisp: (path: Wisp.Wisp['path']) => Promise<boolean> | boolean;
}
declare const manifest: Manifest;
export default manifest;

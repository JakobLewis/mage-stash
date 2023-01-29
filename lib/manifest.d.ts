import * as Wisp from './wisp.js';
import * as Plugin from './plugin.js';
export interface Manifest extends Plugin.Plugin {
    readonly readWisp: (path: Wisp.Wisp['path']) => Promise<Wisp.Wisp | undefined> | Wisp.Wisp | undefined;
    readonly writeWisp: (wisp: Wisp.Wisp) => Promise<boolean> | boolean;
    readonly deleteWisp: (path: Wisp.Wisp['path']) => Promise<boolean> | boolean;
}
declare const manifest: Manifest;
export default manifest;

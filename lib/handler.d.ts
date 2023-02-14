import { Plugin } from './plugin.js';
export interface Handler extends Plugin {
    readonly name: string;
    /** Called every time an owned plugin is loaded. */
    readonly add: (plugin: Plugin) => void;
    /** Called every time an owned plugin is removed during runtime. Note that this isn't called at mage-stash exit */
    readonly remove: (plugin: Plugin) => void;
    readonly hooks: {
        readonly start?: () => void;
        readonly stop?: () => void;
    };
}
export declare function isValid(handler: any): handler is Handler;
export declare function load(handler: Handler): boolean;
export declare function remove(handlerName: Handler['name']): boolean;

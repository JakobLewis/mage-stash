/// <reference types="node" />
import EventEmitter from 'events';
export interface Plugin {
    readonly name: string;
    readonly hooks: {
        readonly start?: () => void;
        readonly stop?: () => void;
    };
}
interface PluginEvents extends EventEmitter {
    on(event: 'loadingPlugin', listener: (plugin: Plugin) => void): this;
    on(event: 'removingPlugin', listener: (plugin: Plugin) => void): this;
    emit(event: 'loadingPlugin', plugin: Plugin): boolean;
    emit(event: 'removingPlugin', plugin: Plugin): boolean;
}
export declare const events: PluginEvents;
export declare function isValid(plugin: any): plugin is Plugin;
export declare function load(plugin: Plugin): boolean;
export declare function remove(plugin: Plugin): boolean;
export {};

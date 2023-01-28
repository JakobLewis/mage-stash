export interface Plugin {
    readonly name: string;
    readonly hooks: {
        readonly start?: () => void;
        readonly stop?: () => void;
    };
}
export declare function load(plugin: Plugin): boolean;
export declare function remove(plugin: Plugin): boolean;

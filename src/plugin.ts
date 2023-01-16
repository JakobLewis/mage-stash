
// TODO: Solidify search behavior
// TODO: Implement partial/scoped search

/* TODO: Migrate common code from library.ts & manifest.ts here instead
export interface Quartermaster<T extends Plugin> {
    readonly domainName: string;
    readonly ownedPlugins: T[];

    readonly hooks: {
        readonly start: () => void;
        // Can reject plugins
        readonly loadingPlugin: (plugin: any) => plugin is T;
        readonly removingPlugin: (plugin: T) => void;
        readonly stop: () => void;
    }
}
*/

export interface Plugin {
    /** The unique display name of this plugin */
    readonly name: string;

    /** Lifecycle hooks */
    readonly hooks: {
        /** Triggered before the plugin is loaded */
        readonly start?: () => void;
        /** Triggered after the plugin is unloaded */
        readonly stop?: () => void;
    }
}
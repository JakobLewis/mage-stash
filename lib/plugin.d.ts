export interface Plugin {
    /** The unique display name of this plugin */
    readonly name: string;
    /** Lifecycle hooks */
    readonly hooks: {
        /** Triggered before the plugin is loaded */
        readonly start?: () => void;
        /** Triggered after the plugin is unloaded */
        readonly stop?: () => void;
    };
}

export declare const config: {
    /** Stops all log-related console output when enabled */
    quiet: boolean;
};
declare const logTags: {
    /** Unrecoverable error */
    readonly 0: "FAT";
    /** Recoverable error */
    readonly 1: "ERR";
    /** Warning */
    readonly 2: "WAR";
    /** Informative */
    readonly 3: "INF";
};
export default class Logger {
    readonly location: string;
    preface: string;
    constructor(location: string, preface?: string);
    addPreface(msg: string): void;
    static write(lvl: keyof typeof logTags, location: string, msg: string, immediate: boolean): void;
    static parseError(e: any): string;
    descriptiveError(msg: string, e: any, immediate?: boolean): void;
    error(e: any, immediate?: boolean): void;
    warn(msg: string, immediate?: boolean): void;
    info(msg: string, immediate?: boolean): void;
}
export {};

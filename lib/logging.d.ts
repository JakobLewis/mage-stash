export declare const config: {
    /** Stops info messages when true */
    readonly quiet: boolean;
    /** Appends logs to a timestamped file in ./logs when true */
    readonly logToFile: boolean;
};
declare const logTags: {
    /** Unrecoverable/fatal error */
    readonly 0: "FATAL";
    /** Recoverable error */
    readonly 1: "ERROR";
    /** Warning */
    readonly 2: "WARN ";
    /** Informative */
    readonly 3: "INFO ";
};
export default class Logger {
    readonly location: string;
    preface: string;
    constructor(location: string, preface?: string);
    addPreface(msg: string): void;
    static write(lvl: keyof typeof logTags, location: string, msg: string, sync: boolean): void;
    static parseError(e: any): string;
    descriptiveError(msg: string, e?: any, sync?: boolean): void;
    error(e: any, sync?: boolean): void;
    warn(msg: string, sync?: boolean): void;
    info(msg: string, sync?: boolean): void;
}
export {};

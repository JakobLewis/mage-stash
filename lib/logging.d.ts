export declare const configArguments: {
    quiet: boolean;
    logToFile: boolean;
};
declare const LoggingLevels: {
    readonly 0: "FATAL";
    readonly 1: "ERROR";
    readonly 2: "WARN";
    readonly 3: "INFO";
};
type LoggingStats = {
    [key in (typeof LoggingLevels)[keyof typeof LoggingLevels]]: number;
};
export default class Logger {
    readonly location: string;
    preface: string;
    private static _stats;
    static get stats(): LoggingStats;
    constructor(location: string, preface?: string);
    addPreface(msg: string): void;
    static write(lvl: keyof typeof LoggingLevels, location: string, msg: string, sync: boolean): void;
    static parseError(e: any): string;
    static purge(): void;
    descriptiveError(msg: string, e?: any, sync?: boolean): void;
    error(e: any, sync?: boolean): void;
    warn(msg: string, sync?: boolean): void;
    info(msg: string, sync?: boolean): void;
}
export {};

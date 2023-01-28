export declare const configArguments: {
    readonly quiet: boolean;
    readonly logToFile: boolean;
};
declare const loggingLevels: {
    readonly 0: "FATAL";
    readonly 1: "ERROR";
    readonly 2: "WARN ";
    readonly 3: "INFO ";
};
export default class Logger {
    readonly location: string;
    preface: string;
    constructor(location: string, preface?: string);
    addPreface(msg: string): void;
    static write(lvl: keyof typeof loggingLevels, location: string, msg: string, sync: boolean): void;
    static parseError(e: any): string;
    descriptiveError(msg: string, e?: any, sync?: boolean): void;
    error(e: any, sync?: boolean): void;
    warn(msg: string, sync?: boolean): void;
    info(msg: string, sync?: boolean): void;
}
export {};

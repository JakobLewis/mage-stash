import { promises as fs, appendFileSync, mkdirSync, existsSync, rmSync } from 'fs';

export const configArguments = {
    "quiet": process.argv.includes('--quiet'),  // Do not print information messages
    "logToFile": process.argv.includes('--log'), // Append messages to a file in ./logs when true
    "logFileName": (new Date()).toISOString().replaceAll(':', '-').split('.')[0] + 'Z'
};

const LoggingLevels = {
    0: 'FATAL',
    1: 'ERROR',
    2: 'WARN',
    3: 'INFO'
} as const;

const LevelPadding = Object.values(LoggingLevels).reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0);

class UnknownError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'UnknownError';
    }
}

type LoggingStats = {
    [key in (typeof LoggingLevels)[keyof typeof LoggingLevels]]: number;
};

if (!existsSync('./logs') && configArguments.logToFile) mkdirSync('./logs');

export default class Logger {

    readonly location: string;
    preface: string;

    private static lines = new Array<string>();

    private static _stats: LoggingStats = {
        'FATAL': 0,
        'ERROR': 0,
        'WARN': 0,
        'INFO': 0
    };

    static get stats(): LoggingStats {
        return { ...Logger._stats };
    }

    constructor(location: string, preface?: string) {
        this.location = location;
        this.preface = preface ? preface : '';
    }

    addPreface(msg: string) {
        this.preface = this.preface + msg;
    }

    static write(lvl: keyof typeof LoggingLevels, location: string, msg: string, sync: boolean) {
        const lvlName = LoggingLevels[lvl];
        Logger._stats[lvlName] += 1;
        const completeMsg = `${Date.now()} ${lvlName.padEnd(LevelPadding)} ${location} ${msg}`.replaceAll('\n', '\n    ');
        if (!configArguments.quiet || lvl < 3) console.log(completeMsg);
        if (configArguments.logToFile)
            sync ? appendFileSync(`./logs/${configArguments.logFileName}.log`, completeMsg + '\n') : this.lines.push(completeMsg);
    }

    static flush(): Promise<void> | void;
    static flush(sync: true): void;
    static flush(sync = false): Promise<void> | void {
        if (Logger.lines.length === 0) return;
        const msg = Logger.lines.join('\n') + '\n';
        Logger.lines.length = 0;
        return sync ? appendFileSync(`./logs/${configArguments.logFileName}.log`, msg) : fs.appendFile(`./logs/${configArguments.logFileName}.log`, msg);
    }

    static parseError(e: any): string {
        if (e instanceof Error && e.stack !== undefined) return e.stack;

        const errorLines = (new UnknownError(String(e))).stack!.split('\n');
        errorLines.splice(1, 2);
        return errorLines.join('\n');
    }

    static purge(): void {
        this.lines.length = 0;
        rmSync(`./logs/${configArguments.logFileName}.log`);
    }

    descriptiveError(msg: string, e: any = '', sync = false) {
        Logger.write(1, this.location, this.preface + msg + Logger.parseError(e), sync);
    }

    error(e: any, sync = false) {
        Logger.write(1, this.location, this.preface + Logger.parseError(e), sync);
    }

    warn(msg: string, sync = false) {
        Logger.write(2, this.location, this.preface + msg, sync);
    }

    info(msg: string, sync = false) {
        Logger.write(3, this.location, this.preface + msg, sync);
    }

    static ensureLogDirExists(): void {
        if (!existsSync('./logs')) mkdirSync('./logs');
    }
}

setInterval(Logger.flush, 1000).unref();

process.on('exit', () => Logger.flush(true));

process.on('uncaughtException', (e, origin) => {
    Logger.write(0, 'logger.js', origin + ' ' + Logger.parseError(e), true);
    process.exitCode = 1;
});
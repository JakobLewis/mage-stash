import { promises as fs, appendFileSync, mkdirSync, existsSync } from 'fs';

export const configArguments = {
    "quiet": process.argv.includes('--quiet'),  // Do not print information messages
    "logToFile": process.argv.includes('--log') // Append messages to a file in ./logs when true
} as const;

const logFileName = (new Date()).toISOString().split('T')[0]! + ' ' + (Math.round(Date.now() / 1000) % 100000).toString() + 'Z';

const loggingLevels = {
    0: 'FATAL',
    1: 'ERROR',
    2: 'WARN ',
    3: 'INFO '
} as const;

if (!existsSync('./logs')) mkdirSync('./logs');

export default class Logger {

    readonly location: string;
    preface: string;

    constructor(location: string, preface?: string) {
        this.location = location;
        this.preface = preface ? preface : '';
    }

    addPreface(msg: string) {
        this.preface = this.preface + msg;
    }

    static write(lvl: keyof typeof loggingLevels, location: string, msg: string, sync: boolean) {
        const completeMsg = `${Date.now()} ${loggingLevels[lvl]} ${location} ${msg}`.replaceAll('\n', '     \n');
        if (!configArguments.quiet || lvl < 3) console.log(completeMsg);
        if (configArguments.logToFile)
            sync ? appendFileSync(`./logs/${logFileName}.log`, completeMsg + '\n') : fs.appendFile(`./logs/${logFileName}.log`, completeMsg + "\n");
    }

    static parseError(e: any): string {
        return e instanceof Error && e.stack !== undefined ? e.stack : 'Unknown error raised: ' + String(e);
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
}

process.on('uncaughtException', (e, origin) => {
    Logger.write(0, 'logger.js', origin + ' ' + Logger.parseError(e), true);
    process.exitCode = 1;
});
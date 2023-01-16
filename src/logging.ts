import { promises as fs, appendFileSync, mkdirSync, existsSync } from 'fs';
import { exit } from 'process';

export const config = {
    /** Stops all log-related console output when enabled */
    "quiet": false,
};

const logFileName = Date.now();

const logTags = {
    /** Unrecoverable error */
    0: 'FAT',
    /** Recoverable error */
    1: 'ERR',
    /** Warning */
    2: 'WAR',
    /** Informative */
    3: 'INF'
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

    static write(lvl: keyof typeof logTags, location: string, msg: string, immediate: boolean) {
        const completeMsg = `${Date.now()} ${logTags[lvl]}@${location.replaceAll('@', '\@')} ${msg}`.replaceAll('\n', '     \n').replaceAll('@', '\@');
        if (!config.quiet) console.log(completeMsg);
        immediate ? appendFileSync(`./logs/${logFileName}.txt`, completeMsg + '\n') : fs.appendFile(`./logs/${logFileName}.txt`, completeMsg + "\n");
    }

    static parseError(e: any): string {
        return e instanceof Error && e.stack !== undefined ? e.stack : 'Unknown error raised: ' + String(e);
    }

    descriptiveError(msg: string, e: any, immediate = false) {
        Logger.write(1, this.location, this.preface + msg + Logger.parseError(e), immediate);
    }

    error(e: any, immediate = false) {
        Logger.write(1, this.location, this.preface + Logger.parseError(e), immediate);
    }

    warn(msg: string, immediate = false) {
        Logger.write(2, this.location, this.preface + msg, immediate);
    }

    info(msg: string, immediate = false) {
        Logger.write(3, this.location, this.preface + msg, immediate);
    }
}

process.on('uncaughtException', (e) => {
    Logger.write(0, 'logger.js', Logger.parseError(e), true);
    exit(1);
});

Logger.write(3, 'logger.js', 'Started', true);
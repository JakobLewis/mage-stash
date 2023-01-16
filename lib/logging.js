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
};
if (!existsSync('./logs'))
    mkdirSync('./logs');
export default class Logger {
    location;
    preface;
    constructor(location, preface) {
        this.location = location;
        this.preface = preface ? preface : '';
    }
    addPreface(msg) {
        this.preface = this.preface + msg;
    }
    static write(lvl, location, msg, immediate) {
        const completeMsg = `${Date.now()} ${logTags[lvl]}@${location.replaceAll('@', '\@')} ${msg}`.replaceAll('\n', '     \n').replaceAll('@', '\@');
        if (!config.quiet)
            console.log(completeMsg);
        immediate ? appendFileSync(`./logs/${logFileName}.txt`, completeMsg + '\n') : fs.appendFile(`./logs/${logFileName}.txt`, completeMsg + "\n");
    }
    static parseError(e) {
        return e instanceof Error && e.stack !== undefined ? e.stack : 'Unknown error raised: ' + String(e);
    }
    descriptiveError(msg, e, immediate = false) {
        Logger.write(1, this.location, this.preface + msg + Logger.parseError(e), immediate);
    }
    error(e, immediate = false) {
        Logger.write(1, this.location, this.preface + Logger.parseError(e), immediate);
    }
    warn(msg, immediate = false) {
        Logger.write(2, this.location, this.preface + msg, immediate);
    }
    info(msg, immediate = false) {
        Logger.write(3, this.location, this.preface + msg, immediate);
    }
}
process.on('uncaughtException', (e) => {
    Logger.write(0, 'logger.js', Logger.parseError(e), true);
    exit(1);
});
Logger.write(3, 'logger.js', 'Started', true);

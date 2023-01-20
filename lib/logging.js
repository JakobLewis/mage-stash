import { promises as fs, appendFileSync, mkdirSync, existsSync } from 'fs';
export const config = {
    /** Stops info messages when true */
    "quiet": process.argv.includes('--quiet'),
    /** Appends logs to a timestamped file in ./logs when true */
    "logToFile": process.argv.includes('--log')
};
(new Date()).getSeconds;
const logFileName = (new Date()).toISOString().split('T')[0] + ' ' + (Math.round(Date.now() / 1000) % 100000).toString() + 'Z';
const logTags = {
    /** Unrecoverable/fatal error */
    0: 'FATAL',
    /** Recoverable error */
    1: 'ERROR',
    /** Warning */
    2: 'WARN ',
    /** Informative */
    3: 'INFO '
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
    static write(lvl, location, msg, sync) {
        const completeMsg = `${Date.now()} ${logTags[lvl]} ${location} ${msg}`.replaceAll('\n', '     \n');
        if (!config.quiet || lvl < 3)
            console.log(completeMsg);
        if (config.logToFile)
            sync ? appendFileSync(`./logs/${logFileName}.log`, completeMsg + '\n') : fs.appendFile(`./logs/${logFileName}.log`, completeMsg + "\n");
    }
    static parseError(e) {
        return e instanceof Error && e.stack !== undefined ? e.stack : 'Unknown error raised: ' + String(e);
    }
    descriptiveError(msg, e = '', sync = false) {
        Logger.write(1, this.location, this.preface + msg + Logger.parseError(e), sync);
    }
    error(e, sync = false) {
        Logger.write(1, this.location, this.preface + Logger.parseError(e), sync);
    }
    warn(msg, sync = false) {
        Logger.write(2, this.location, this.preface + msg, sync);
    }
    info(msg, sync = false) {
        Logger.write(3, this.location, this.preface + msg, sync);
    }
}
process.on('uncaughtException', (e, origin) => {
    Logger.write(0, 'logger.js', origin + ' ' + Logger.parseError(e), true);
    process.exitCode = 1;
});
Logger.write(3, 'logger.js', 'Started', true);

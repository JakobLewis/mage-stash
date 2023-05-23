import { promises as fs, appendFileSync, mkdirSync, existsSync, rmSync } from 'fs';
export const configArguments = {
    "quiet": process.argv.includes('--quiet'),
    "logToFile": process.argv.includes('--log'),
    "logFileName": (new Date()).toISOString().replaceAll(':', '-').split('.')[0] + 'Z'
};
const LoggingLevels = {
    0: 'FATAL',
    1: 'ERROR',
    2: 'WARN',
    3: 'INFO'
};
const LevelPadding = Object.values(LoggingLevels).reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0);
class UnknownError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'UnknownError';
    }
}
if (!existsSync('./logs') && configArguments.logToFile)
    mkdirSync('./logs');
export default class Logger {
    location;
    preface;
    static lines = new Array();
    static _stats = {
        'FATAL': 0,
        'ERROR': 0,
        'WARN': 0,
        'INFO': 0
    };
    static get stats() {
        return { ...Logger._stats };
    }
    constructor(location, preface) {
        this.location = location;
        this.preface = preface ? preface : '';
    }
    addPreface(msg) {
        this.preface = this.preface + msg;
    }
    static write(lvl, location, msg, sync) {
        const lvlName = LoggingLevels[lvl];
        Logger._stats[lvlName] += 1;
        const completeMsg = `${Date.now()} ${lvlName.padEnd(LevelPadding)} ${location} ${msg}`.replaceAll('\n', '\n    ');
        if (!configArguments.quiet || lvl < 3)
            console.log(completeMsg);
        if (configArguments.logToFile)
            sync ? appendFileSync(`./logs/${configArguments.logFileName}.log`, completeMsg + '\n') : this.lines.push(completeMsg);
    }
    static flush(sync = false) {
        if (Logger.lines.length === 0)
            return;
        const msg = Logger.lines.join('\n') + '\n';
        Logger.lines.length = 0;
        return sync ? appendFileSync(`./logs/${configArguments.logFileName}.log`, msg) : fs.appendFile(`./logs/${configArguments.logFileName}.log`, msg);
    }
    static parseError(e) {
        return e instanceof Error && e.stack !== undefined ?
            e.stack : (new UnknownError(String(e))).stack.split('\n').slice(2).join('\n');
    }
    static purge() {
        this.lines.length = 0;
        rmSync(`./logs/${configArguments.logFileName}.log`);
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
    static ensureLogDirExists() {
        if (!existsSync('./logs'))
            mkdirSync('./logs');
    }
}
setInterval(Logger.flush, 1000).unref();
process.on('exit', () => Logger.flush(true));
process.on('uncaughtException', (e, origin) => {
    Logger.write(0, 'logger.js', origin + ' ' + Logger.parseError(e), true);
    process.exitCode = 1;
});

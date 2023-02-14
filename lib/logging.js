import { promises as fs, appendFileSync, mkdirSync, existsSync, rmSync } from 'fs';
export const configArguments = {
    "quiet": process.argv.includes('--quiet'),
    "logToFile": process.argv.includes('--log') // Append messages to a file in ./logs when true
};
const logFileName = (new Date()).toISOString().split('T')[0] + ' ' + (Math.round(Date.now() / 1000) % 100000).toString() + 'Z';
const LoggingLevels = {
    0: 'FATAL',
    1: 'ERROR',
    2: 'WARN',
    3: 'INFO'
};
const LevelPadding = Object.values(LoggingLevels).reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0);
if (!existsSync('./logs'))
    mkdirSync('./logs');
export default class Logger {
    location;
    preface;
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
            sync ? appendFileSync(`./logs/${logFileName}.log`, completeMsg + '\n') : fs.appendFile(`./logs/${logFileName}.log`, completeMsg + "\n");
    }
    static parseError(e) {
        return e instanceof Error && e.stack !== undefined ? e.stack : 'Unknown error raised: ' + String(e);
    }
    static purge() {
        rmSync(`./logs/${logFileName}.log`);
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

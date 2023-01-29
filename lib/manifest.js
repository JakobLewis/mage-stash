import * as Wisp from './wisp.js';
import { compressSync, decompressSync } from './strings.js';
import Logger from './logging.js';
import { promises as fs, existsSync, mkdirSync } from 'fs';
const storagePath = './store';
const logger = new Logger('fsCache.js');
async function readWisp(path) {
    let compressedString;
    try {
        compressedString = (await fs.readFile(storagePath + path)).toString();
    }
    catch (e) {
        // TODO: Log unexpected errors
        return undefined;
    }
    let wisp;
    try {
        const decompressedString = decompressSync(compressedString);
        wisp = { path, ...JSON.parse(decompressedString) };
    }
    catch (e) {
        logger.descriptiveError(`Decompression/parsing failed for Wisp<${path}>: `, e);
        return undefined;
    }
    if ('content' in wisp)
        return wisp;
    try {
        const content = (await fs.readdir(storagePath + path + '.children')).filter(Wisp.isValidLocalID);
        return { ...wisp, content };
    }
    catch (e) {
        logger.descriptiveError(`GroupWisp<${path}> threw while reading content directory: `, e);
        return undefined;
    }
}
async function writeWisp(wisp) {
    const { path, content, metadata } = wisp;
    const writePath = storagePath + path;
    if (typeof content !== 'object')
        await fs.writeFile(writePath, compressSync(JSON.stringify({ content, metadata })));
    else {
        try {
            await fs.mkdir(writePath + '.children');
        }
        catch (e) {
            if (!(e instanceof Error) || !(e.errno === '-4075' && e.syscall === 'mkdir')) {
                logger.descriptiveError(`GroupWisp<${path}> child directory creation failed: `, e);
                return false;
            }
        }
        await fs.writeFile(writePath, JSON.stringify({ metadata }));
    }
    return true;
}
async function deleteWisp(wispUID) {
    try {
        await Promise.all([
            fs.rm(storagePath + wispUID, { force: true }),
            fs.rm(storagePath + wispUID + '.children', { force: true, recursive: true })
        ]);
        return true;
    }
    catch (e) {
        logger.descriptiveError(`Error while deleting Wisp<${wispUID}>: `, e);
        return false;
    }
}
const manifest = {
    name: 'manifest',
    hooks: {
        start: () => existsSync(storagePath) ? null : mkdirSync(storagePath)
    },
    writeWisp,
    deleteWisp,
    readWisp
};
export default manifest;

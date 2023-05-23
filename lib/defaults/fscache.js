import { promises as fs, existsSync, mkdirSync } from 'fs';
import { ManifestSymbol } from '../manifest.js';
import * as Wisp from '../wisp.js';
import Logger from '../logging.js';
const logger = new Logger('manifest.js');
const storagePath = './store';
if (!existsSync(storagePath))
    mkdirSync(storagePath);
const plugin = {
    name: 'fscache',
    domain: ManifestSymbol,
    hooks: {},
    readWisp: async function (path) {
        //throw new Error('Function not implemented.');
        try { // Assume Wisp<T> is a ContentWisp
            const decompressedString = (await fs.readFile(storagePath + path)).toString();
            const wisp = JSON.parse(decompressedString);
            if (typeof wisp === 'string')
                return { path, content: wisp };
            return { path, ...wisp };
        }
        catch (e) {
            // EISDIR code signifies that we tried to read a directory
            if (typeof e !== 'object' || e == null || !('code' in e) || e.code !== 'EISDIR') {
                logger.descriptiveError(`Manifest.readWisp('${path}') threw: `, e);
                return undefined;
            }
            try {
                const files = await fs.readdir(storagePath + path);
                const readPromise = files.includes('metadata.json') ? fs.readFile(storagePath + path + '/metadata.json') : undefined;
                const content = files.filter(Wisp.isValidLocalID).sort();
                if (readPromise === undefined)
                    return { path, content };
                else
                    return {
                        path, content, metadata: JSON.parse((await readPromise).toString())
                    };
            }
            catch (e2) {
                logger.descriptiveError(`Manifest.readWisp('${path}') threw: `, e2);
                return undefined;
            }
        }
    },
    writeWisp: async function (wisp) {
        //throw new Error('Function not implemented.');
        // Very clunky, inefficient. Needs write-queue before type-caching can be used for faster reads
        const { path, content, metadata } = wisp;
        const writePath = storagePath + path;
        try {
            await fs.rm(writePath, { force: true, recursive: true });
            if (typeof content === 'object') {
                try {
                    await fs.mkdir(writePath);
                }
                catch (e) {
                    if (typeof e !== 'object' || e == null || !('code' in e) || e.code !== 'EEXIST') {
                        logger.descriptiveError(`GroupWisp<${path}> directory creation failed: `, e);
                        return false;
                    }
                }
                if (metadata !== undefined)
                    await fs.writeFile(writePath + '/metadata.json', JSON.stringify(metadata));
            }
            else
                metadata === undefined ? await fs.writeFile(writePath, JSON.stringify(content)) : await fs.writeFile(writePath, JSON.stringify({ content, metadata }));
        }
        catch (e) {
            logger.descriptiveError(`Wisp<${path}> writing failed: `, e);
            return false;
        }
        return true;
    },
    deleteWisp: async function (path) {
        //throw new Error('Function not implemented.');
        try {
            await fs.rm(storagePath + path, { recursive: true });
            return true;
        }
        catch (e) {
            if (typeof e !== 'object' || e == null || !('code' in e) || e.code !== 'ENOENT')
                logger.descriptiveError(`Error while deleting Wisp<${path}>: `, e);
            return false;
        }
    }
};
export default plugin;

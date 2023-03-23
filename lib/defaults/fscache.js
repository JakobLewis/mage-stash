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
        throw new Error('Function not implemented.');
        if (!Wisp.isValidPath(path))
            throw new Wisp.MalformedPathError(path);
        try { // Assume Wisp<T> is a ContentWisp
            const decompressedString = (await fs.readFile(storagePath + path)).toString();
            const wisp = JSON.parse(decompressedString);
            return { ...wisp, path };
        }
        catch (e) {
            // EISDIR code signifies that we tried to read a directory
            // @ts-expect-error
            if (!(e instanceof Error && 'code' in e && e.code === 'EISDIR')) {
                logger.descriptiveError(`Manifest.readWisp('${path}') threw: `, e);
                return undefined;
            }
            try {
                const files = await fs.readdir(storagePath + path);
                if (!files.includes('metadata.json'))
                    return undefined;
                const readPromise = fs.readFile(storagePath + path + '/metadata.json');
                const content = files.filter(Wisp.isValidLocalID);
                const metadata = JSON.parse((await readPromise).toString());
                return {
                    path, content, metadata
                };
            }
            catch (e2) {
                logger.descriptiveError(`Manifest.readWisp('${path}') threw: `, e2);
                return undefined;
            }
        }
    },
    writeWisp: async function (wisp) {
        throw new Error('Function not implemented.');
        // Very clunky, inefficient. Needs write-queue before type-caching can be used for faster reads
        try {
            Wisp.assertIsValid(wisp);
        }
        catch (e) {
            logger.warn(`writeWisp ` + Logger.parseError(e));
            return false;
        }
        const { path, content, metadata } = wisp;
        const writePath = storagePath + path;
        try {
            if (typeof content === 'object') {
                try {
                    await fs.mkdir(writePath);
                }
                catch (e) {
                    if (!(e instanceof Error) || !(e.code === 'EEXIST' && e.syscall === 'mkdir')) {
                        logger.descriptiveError(`GroupWisp<${path}> directory creation failed: `, e);
                        return false;
                    }
                }
                await fs.writeFile(writePath + '/metadata.json', JSON.stringify(metadata));
            }
            else
                await fs.writeFile(writePath, JSON.stringify({ content, metadata }));
        }
        catch {
            return false;
        }
        return true;
    },
    deleteWisp: async function (path) {
        throw new Error('Function not implemented.');
        if (!Wisp.isValidPath(path))
            throw new Wisp.MalformedPathError(path);
        try {
            await Promise.all([
                fs.rm(storagePath + path, { force: true, recursive: true }),
            ]);
            return true;
        }
        catch (e) {
            logger.descriptiveError(`Error while deleting Wisp<${path}>: `, e);
            return false;
        }
    }
};
export default plugin;

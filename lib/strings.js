import lzutf8 from 'lzutf8';
import { createHash } from 'crypto';
const { compress, decompress } = lzutf8;
export function hash(input) {
    return createHash('md5').update(input, 'utf-8').digest('hex');
}
export function compressSync(s) {
    return compress(s, { outputEncoding: 'BinaryString' });
}
export function decompressSync(s) {
    return decompress(s, { inputEncoding: 'BinaryString' });
}

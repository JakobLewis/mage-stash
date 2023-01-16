import lzutf8 from 'lzutf8';
import { createHash } from 'crypto';

const { compress, decompress } = lzutf8;

// TODO: Implement threaded async operations with Workers

export function hash(input: string): string {
    return createHash('md5').update(input, 'utf-8').digest('hex');
}

export function compressSync(s: string): string {
    return compress(s, { outputEncoding: 'BinaryString' });
}

export function decompressSync(s: string): string {
    return decompress(s, { inputEncoding: 'BinaryString' });
}
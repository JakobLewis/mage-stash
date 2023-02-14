// @ts-check
import { rmSync, readdirSync, existsSync } from "fs";

for (const filehandle of readdirSync('./lib', {withFileTypes: true})) {
    const path = './lib/' + filehandle.name;
    if (filehandle.isFile()) rmSync(path);
    else if (filehandle.isDirectory()) rmSync(path, { recursive: true, force: true });
}


if (existsSync('./store/temp'))
    rmSync('./store/temp', {recursive: true, force: true});



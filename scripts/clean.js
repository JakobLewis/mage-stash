// @ts-check
import { rmSync, readdirSync, existsSync } from "fs";

readdirSync('./lib', {withFileTypes: true})
    .forEach(dirent=>{
        const path = './lib/' + dirent.name;
        if (dirent.isFile()) rmSync(path);
        else if (dirent.isDirectory()) rmSync(path, { recursive: true, force: true });
    });
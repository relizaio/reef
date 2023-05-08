import fs from 'node:fs/promises'
import path from 'path'

async function sleepForTime(timeMs: number) {
    return new Promise((resolve, reject) => {
        setTimeout((() => {
            resolve(true)
        }), timeMs)
    })
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

async function copyDir(src: string, dest: string) {
    await fs.mkdir(dest, { recursive: true })
    let entries = await fs.readdir(src, { withFileTypes: true })

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await fs.copyFile(srcPath, destPath);
    }
}

export default {
    copyDir,
    sleep: sleepForTime,
    uuidv4
}
import fs from 'node:fs/promises'
import path from 'path'
import childProcess from 'child_process'

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

function shellExec(cmd: string, args: any[], timeout?: number): Promise<string> { // timeout = in ms
    return new Promise((resolve, reject) => {
        let options: any = {}
        if (timeout) options.timeout = timeout
        const child = childProcess.spawn(cmd, args, options)
        let resData = ""
        child.stdout.on('data', (data)=> {
            resData += data
        })
      
        child.stderr.on('data', (data) => {
            console.error(`shell command error: ${data}`)
        })
  
        child.on('close', (code) => {
            if (code !== 0) console.log(`shell process exited with code ${code}`)
            if (code === 0) {
                if (resData) {
                    resData = resData.replace(/\n$/, "")
                }
                resolve(resData)
            } else {
                console.error(resData)
                reject(resData)
            }
        })
    })
}

export default {
    copyDir,
    shellExec,
    sleep: sleepForTime,
    uuidv4
}
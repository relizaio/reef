import fs from 'node:fs/promises'
import childProcess from 'child_process'
import path from 'path'
import constants from './utils/constants'
import initialize from './api/initialize'

// add timestamps in front of log messages
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')

var securityGroupId = ''
var subnetId = ''
var azureSubnetId = ''
var azureSecurityGroupId = ''

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

initialize.startup()
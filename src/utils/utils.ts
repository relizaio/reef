import fs from 'node:fs/promises'
import { writeFile } from 'node:fs'
import path from 'path'
import childProcess from 'child_process'
import constants from './constants'

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

async function deleteDir(dir: string) {
    try {
        await fs.rm(dir, {recursive: true, force: true})
        console.log(`directory ${dir} deleted`)
    } catch (err: any) {
        console.error(err)
    }
}

async function saveJsonToFile (path: string, jsonObj: any) {
    const fileData = JSON.stringify(jsonObj)
    writeFile(path, fileData, (err: any) => {
        if (err) {
            console.error(err)
            throw err
        }
    })
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

function parseTfOutput(tfOutput: string) {
    const tfOutArray = tfOutput.split('Outputs:')
    const tfOutMap: any = {}
    if (tfOutArray.length > 1) {
        const outputsStr = tfOutArray[tfOutArray.length - 1]
        const outStrings = outputsStr.split(/(?:\r\n|\r|\n|\x1B\[\dm)/g);
        outStrings.forEach(os => {
            if (os && os.length > 1) {
                const kvArr = os.split(' = "')
                if (kvArr.length > 1) {
                    tfOutMap[kvArr[0]] = kvArr[1].replace(/"$/, '')
                }
            }
        })
        console.log(outputsStr)
    } else {
        console.log('No outputs in tf parse')
    }
    return tfOutMap
}

/**
 * Returns directory where git is checked out
 * @param gitUri 
 * @param gitPath 
 */
async function gitCheckout (gitUri: string, gitPath: string, gitBranch: string): Promise<string> {
    const gitCheckoutId = constants.GIT_PREFIX + uuidv4()
    const checkoutPath = `./${constants.TF_SPACE}/${gitCheckoutId}`
    await fs.mkdir(checkoutPath)
    let checkoutCmd = ''
    if (!gitPath || gitPath === '.' || gitPath === './' || gitPath === '/') {
        checkoutCmd = `cd ${checkoutPath} && git init && git remote add origin ${gitUri} && git pull --depth=1 origin ${gitBranch}`
    } else {
        checkoutCmd = `cd ${checkoutPath} && git init && git remote add origin ${gitUri} && git config --local core.sparsecheckout true && echo "${gitPath}/*" >> .git/info/sparse-checkout && git pull --depth=1 origin ${gitBranch}`
    }
    const gitCheckoutData = await shellExec('sh', ['-c', checkoutCmd], 15*60*1000)
    console.log(gitCheckoutData)
    return checkoutPath
}

export default {
    copyDir,
    deleteDir,
    gitCheckout,
    parseTfOutput,
    saveJsonToFile,
    shellExec,
    sleep: sleepForTime,
    uuidv4
}
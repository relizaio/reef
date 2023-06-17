import * as fsp from 'node:fs/promises'
import * as fs from 'node:fs'
import path from 'path'
import childProcess from 'child_process'
import constants from './constants'
import { TfVarDefinition } from '../model/Template'

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
    await fsp.mkdir(dest, { recursive: true })
    let entries = await fsp.readdir(src, { withFileTypes: true })

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await fsp.copyFile(srcPath, destPath);
    }
}

async function deleteDir(dir: string) {
    try {
        await fsp.rm(dir, {recursive: true, force: true})
        console.log(`directory ${dir} deleted`)
    } catch (err: any) {
        console.error(err)
    }
}

async function saveJsonToFile (path: string, jsonObj: any) {
    const fileData = JSON.stringify(jsonObj)
    fs.writeFile(path, fileData, (err: any) => {
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

async function parseTfDirectoryForVariables (path: string) : Promise<TfVarDefinition[]> {
    const filesToConsider = await fsp.readdir(path, {withFileTypes: true}) // TODO implement {recursive: true} option when available
    let parsedTfVars: TfVarDefinition[] = []
    for (const f of filesToConsider) {
        if (f.isFile()) {
            const curVars = await parseFileIntoTfVars(path + '/' + f.name)
            if (curVars && curVars.length) {
                parsedTfVars = parsedTfVars.concat(curVars)
            }
        }
    }
    return parsedTfVars
}

async function parseFileIntoTfVars (path: string) : Promise<TfVarDefinition[]> {
    const vars: TfVarDefinition[] = []
    const file = await fsp.open(path)
    let curVar: TfVarDefinition = new TfVarDefinition()
    let inVar: boolean = false
    for await (const line of file.readLines()) {
        if (inVar && line.trim() === '}') {
            vars.push(curVar)
            curVar = new TfVarDefinition()
            inVar = false
        } else if (line.includes('variable')) {
            inVar = true
            const varName = line.split('variable')[1].replaceAll('{', '').replaceAll('"', '').trim()
            curVar.key = varName
        } else if (inVar && line.includes(' default ')) {
            curVar.hasDefault = true
        } else if (inVar && line.includes(' type ')) {
            // TODO type
        }
    }
    return vars
}

/**
 * Returns directory where git is checked out
 * @param gitUri
 * @param gitPath
 * @param gitPointer - this can be a branch, a tag or a specific commit hash to pull 
 */
async function gitCheckout (gitUri: string, gitPath: string, gitPointer: string): Promise<GitCheckoutPaths> {
    const gitCheckoutId = constants.GIT_PREFIX + uuidv4()
    const checkoutPath = `./${constants.TF_SPACE}/${gitCheckoutId}`
    let retPath = checkoutPath
    await fsp.mkdir(checkoutPath)
    let checkoutCmd = ''
    if (!gitPath || gitPath === '.' || gitPath === './' || gitPath === '/') {
        checkoutCmd = `cd ${checkoutPath} && git init && git remote add origin ${gitUri} && git pull --depth=1 origin ${gitPointer}`
    } else {
        const cleanedGitPath = gitPath.replace(/^\.\//, '').replace(/^\//, '')
        checkoutCmd = `cd ${checkoutPath} && git init && git remote add origin ${gitUri} && git config --local core.sparsecheckout true && echo "${cleanedGitPath}/*" >> .git/info/sparse-checkout && git pull --depth=1 origin ${gitPointer}`
        retPath = checkoutPath + '/' + cleanedGitPath
    }
    const gitCheckoutData = await shellExec('sh', ['-c', checkoutCmd], 15*60*1000)
    const checkoutPaths: GitCheckoutPaths = {
        checkoutPath: checkoutPath,
        fullTemplatePath: retPath
    }
    return checkoutPaths
}

type GitCheckoutPaths = {
    checkoutPath: string,
    fullTemplatePath: string
}


export default {
    copyDir,
    deleteDir,
    gitCheckout,
    parseTfDirectoryForVariables,
    parseTfOutput,
    saveJsonToFile,
    shellExec,
    sleep: sleepForTime,
    uuidv4
}

export type { GitCheckoutPaths }
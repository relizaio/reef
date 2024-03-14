import * as fsp from 'node:fs/promises'
import * as fs from 'node:fs'
const { join } = require('node:path')
const { spawn } = require('node:child_process')
import constants from './constants'
import { TfVarDefinition } from '../model/Template'
import { GitCheckoutObject } from '../model/GitCheckoutObject'
import { AwsAccount, AzureAccount } from '../model/Account'

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
        let srcPath = join(src, entry.name);
        let destPath = join(dest, entry.name);

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
        const child = spawn(cmd, args, options)
        let resData = ""
        child.stdout.on('data', (data)=> {
            resData += data
        })
      
        child.stderr.on('data', (data) => {
            console.error(`shell command error: ${data}`)
        })
  
        child.on('exit', (code) => {
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
            curVar.value = line.split('default')[1].replaceAll(' = ', '').replaceAll('"', '').trim()
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
async function gitCheckout (gco: GitCheckoutObject): Promise<GitCheckoutPaths> {
    const gitPath = gco.gitPath
    const gitCheckoutId = constants.GIT_PREFIX + uuidv4()
    const checkoutPath = `./${constants.TF_SPACE}/${gitCheckoutId}`
    let retPath = checkoutPath
    let utilPath = ''
    await fsp.mkdir(checkoutPath)
    await shellExec('sh', ['-c', `cd ${checkoutPath} && git init`], 15*60*1000)
    let checkoutCmd = ''
    if (gco.isPrivate) {
        let gitUriForCred = ''
        const uriPartsOne = gco.gitUri.split('//')
        if (uriPartsOne.length > 1) {
            const uriPartsTwo = uriPartsOne[1].split('/')
            gitUriForCred = uriPartsOne[0] + '//' + uriPartsTwo[0]
        } else {
            const uriPartsTwo = gco.gitUri.split('/')
            gitUriForCred = uriPartsTwo[0]
        }
        gitUriForCred += '.username'
        const gitConfigUnameCmd = `cd ${checkoutPath} && git config --local credential.${gitUriForCred} taleodor`
        await shellExec('sh', ['-c', gitConfigUnameCmd], 30*1000)
        utilPath = `./${constants.TF_SPACE}/${constants.CRED_PREFIX}${gitCheckoutId}`
        await fsp.mkdir(utilPath)
        await shellExec('sh', ['-c', `echo "#!/bin/sh" >> ${utilPath}/askpass.sh`], 30*1000)
        await shellExec('sh', ['-c', `echo 'exec echo "${gco.token}"' >> ${utilPath}/askpass.sh`], 30*1000)
        await shellExec('sh', ['-c', `chmod 0700 ${utilPath}/askpass.sh`], 30*1000)
        const gitConfigTokenCmd = `cd ${checkoutPath} && git config --local core.askpass "../../${utilPath}/askpass.sh"`
        await shellExec('sh', ['-c', gitConfigTokenCmd], 30*1000)
    }
    if (!gitPath || gitPath === '.' || gitPath === './' || gitPath === '/') {
        checkoutCmd = `cd ${checkoutPath} && git remote add origin ${gco.gitUri} && git pull --depth=1 origin ${gco.gitPointer}`
    } else {
        const cleanedGitPath = gitPath.replace(/^\.\//, '').replace(/^\//, '')
        checkoutCmd = `cd ${checkoutPath} && git remote add origin ${gco.gitUri} && git config --local core.sparsecheckout true && echo "${cleanedGitPath}/*" >> .git/info/sparse-checkout && git pull --depth=1 origin ${gco.gitPointer}`
        retPath = checkoutPath + '/' + cleanedGitPath
    }
    const gitCheckoutData = await shellExec('sh', ['-c', checkoutCmd], 15*60*1000)
    const checkoutPaths: GitCheckoutPaths = {
        checkoutPath,
        fullTemplatePath: retPath,
        utilPath
    }
    return checkoutPaths
}

async function generateSshKeyPair(): Promise<SshKeyPair> {
    const workDirId = constants.GIT_SSH_PREFIX + uuidv4()
    const workDir = `./${constants.TF_SPACE}/${workDirId}`
    await fsp.mkdir(workDir)
    await shellExec('sh', ['-c', `cd ${workDir} && ssh-keygen -t ed25519 -f ./id -P "" -C ""`], 60*1000)
    const pubkey = await shellExec('sh', ['-c', `cat ${workDir}/id.pub`], 10*1000)
    const privkey = await shellExec('sh', ['-c', `cat ${workDir}/id`], 10*1000)
    await fsp.rm(workDir, {recursive: true, force: true})
    const keyPair: SshKeyPair = {
        privkey,
        pubkey
    }
    return keyPair
}

function getAzureEnvTfPrefix (azureAct: AzureAccount): string {
    return `export ARM_CLIENT_ID=${azureAct.clientId}; export ARM_CLIENT_SECRET=${azureAct.clientSecret}; ` + 
    `export ARM_SUBSCRIPTION_ID=${azureAct.subscriptionId}; export ARM_TENANT_ID=${azureAct.tenantId}; `
}

function getAwsEnvTfPrefix (awsAct: AwsAccount): string {
    return `export AWS_REGION=${awsAct.region}; export AWS_ACCESS_KEY_ID=${awsAct.accessKey}; ` + 
    `export AWS_SECRET_ACCESS_KEY=${awsAct.secretKey}; `
}

function constructTfPipeOutFileName (operation: string) : string {
    const curDate = new Date()
    return curDate.getUTCFullYear() + '-' + curDate.getUTCMonth() + '-' + curDate.getUTCDate() + '_' + curDate.getUTCHours() + '-' + curDate.getUTCMinutes() + '_' + operation + '_' + 'tf_out'
}

function constructTfPipeOut (fname: string): string {
    return ` > ${fname} 2>&1`
}

type GitCheckoutPaths = {
    checkoutPath: string,
    fullTemplatePath: string,
    utilPath: string
}

type SshKeyPair = {
    pubkey: string,
    privkey: string
}


export default {
    constructTfPipeOutFileName,
    constructTfPipeOut,
    copyDir,
    deleteDir,
    generateSshKeyPair,
    getAwsEnvTfPrefix,
    getAzureEnvTfPrefix,
    gitCheckout,
    parseTfDirectoryForVariables,
    parseTfOutput,
    saveJsonToFile,
    shellExec,
    sleep: sleepForTime,
    uuidv4
}

export type { GitCheckoutPaths, SshKeyPair }
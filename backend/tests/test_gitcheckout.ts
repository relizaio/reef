import test from 'node:test'
import assert from 'assert/strict'
import utils from '../src/utils/utils'
import { GitCheckoutObject } from '../src/model/GitCheckoutObject'

test('git checkout test', async (t) => {
    const gco : GitCheckoutObject = {
        gitUri: 'https://github.com/relizaio/reliza-ephemeral-framework.git',
        gitPath: 'terraform_templates/instances/azure_k3s_instance',
        gitPointer: 'main',
        isPrivate: false,
        username: '',
        token: ''
    }
    await utils.gitCheckout(gco)
    assert.strictEqual(1,1)
})
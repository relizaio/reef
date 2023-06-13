import test from 'node:test'
import assert from 'assert/strict'
import utils from '../src/utils/utils'

test('git checkout test', async (t) => {
    await utils.gitCheckout('https://github.com/relizaio/reliza-ephemeral-framework.git', 'terraform_templates/instances/azure_k3s_instance', 'main')
    assert.strictEqual(1,1)
})
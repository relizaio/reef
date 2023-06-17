import test from 'node:test'
import assert from 'assert/strict'
import utils from '../src/utils/utils'

test('tf variable extraction', async (t) => {
    const tfVars = await utils.parseTfDirectoryForVariables('./tests/tf_variable_extraction')
    assert.strictEqual(3,tfVars.length)
})
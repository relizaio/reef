import test from 'node:test'
import assert from 'assert/strict'
import utils from '../src/utils/utils'
import siloTfOutput from './ParseSiloOutput'

test('parse outputs from terraform output', (t) => {
    const tfOutMap = utils.parseTfOutput(siloTfOutput)
    console.warn('test')
    assert.strictEqual(tfOutMap['security_group_id'], '/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/networkSecurityGroups/k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09');
})
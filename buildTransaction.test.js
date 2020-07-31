const { describe } = require('riteway')
const buildTransaction = require('./buildTransaction')

describe('buildTransaction', async assert => {
    const conversation = {
        creator: 'creator', recipient: 'recipient', quantity: '1.0000 SEEDS', title: 'title', summary: 'summary', description: 'description', image: 'image', url: 'url', fund: 'fund',
    }

    assert({
        given: 'conversation',
        should: 'build transaction',
        actual: typeof (await buildTransaction(conversation)),
        expected: 'string'
    })
})
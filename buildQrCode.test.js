const { describe } = require('riteway')
const buildQrCode = require('./buildQrCode')

const esr = 'esr://gmN0S9_Eeqy57zv_9xn9eU3hL_bxCbUs-jptJqsXY3-JtawgE6exSrxL7alJn5YxAAEjQ0EQF_OcZXEgzoqcK66MQPrBJSADLPDWyMgHIXAieOerCbsE1BnAgCXY1dUlmIGBtSSzJCeVvbg0NzexqJI7JbU4uSizoCQzP481MzcxPZW5tCgHrGEC0Bag8QA'

describe('buildQrCode', async assert => {
    assert({
        given: 'build qr code',
        should: 'return image stream',
        actual: typeof (await buildQrCode(esr)),
        expected: 'object'
    })
})
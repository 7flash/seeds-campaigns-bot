const QRCode = require('qrcode')
const fs = require('fs')

function buildQrCode(esr) {
    return new Promise((resolve, reject) => {
        QRCode.toBuffer(esr, (err, buffer) => {
            if (err) return reject(err)

            return resolve(buffer)
        })
    })
}

module.exports = buildQrCode
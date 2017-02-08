'use strict'

const moment = require('moment')

module.exports = {
    encode: encode,
    decode: decode,
    validate: validate
}

function encode(type, value){
    switch (type){
        case 'string':
            return encodeString(value)
        case 'bytes':
            return encodeBytes(value)
        default:
            throw new Error(`Can't encode type: ${type}`)
    }
}

function decode(type, value){
    switch (type){
        case 'address':
            return decodeAddress(value)
        case 'string':
            return decodeString(value)
        case 'bytes':
            return decodeBytes(value)
        default:
            throw new Error(`Can't decode type: ${type}`)
    }
}

function validate(type, value){
    switch (type){
        case 'address':
            return isAddress(value)
        default:
            throw new Error(`Can't validate type: ${type}`)
    }
}

function decodeAddress(value){
    if (value == 0 || value == '0x') return null
    return value
}

function encodeString(value){
    return value ? String(value) : ''
}

function decodeString(value){
    return value || null
}

function encodeBytes(value){
    value = value ? String(value) : ''
    return fromAscii(value, 32)
}

function decodeBytes(value){
    if (!value) return null
    if (!Number(value)) return null
    let decoded = toAscii(value)
    decoded = decoded.replace(/[\u0000]+$/g, '')
    if (!decoded) return null
    return decoded
}

function fromAscii(str, pad){
    if (!str || str == undefined || str == null) str = ''
    pad = pad === undefined ? 0 : pad
    let hex = toHexNative(str)
    while (hex.length < pad * 2) hex += '00'
    return '0x' + hex
}

function toHexNative(str){
    let hex = ''
    for (let i = 0; i < str.length; i++) {
        let n = str.charCodeAt(i).toString(16)
        hex += n.length < 2 ? '0' + n : n
    }
    return hex
}

function toAscii(hex){
    let str = ''
    let i = (hex.substring(0, 2) === '0x') ? 2 : 0
    for (; i < hex.length; i+=2) {
        let code = parseInt(hex.substr(i, 2), 16)
        if (code === 0) continue
        str += String.fromCharCode(code)
    }
    return str
}

function isAddress(address){

    // Check if it has the basic requirements of an address
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) return false

    // If it's all small caps or all all caps, return true
    else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) return true

    // Otherwise check each case
    else return isChecksumAddress(address)
}

function isChecksumAddress(address){

    // Check each case
    address = address.replace('0x','')
    let addressHash = sha3(address.toLowerCase())

    for (let i=0; i<40; i++){

        // The nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) ||
            (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])){
            return false;
        }
    }

    return true
}
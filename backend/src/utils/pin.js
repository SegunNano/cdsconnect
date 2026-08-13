import bcrypt from 'bcryptjs'

export const hashPin = async (pin) => {
    return await bcrypt.hash(pin, 10)
}

export const comparePin = async (pin, hash) => {
    return await bcrypt.compare(pin, hash)
}

export const validatePin = (pin) => {
    const pinRegex = /^\d{4,6}$/
    if (!pinRegex.test(pin)) {
        return { valid: false, message: 'PIN must be 4 to 6 digits only' }
    }
    return { valid: true }
}
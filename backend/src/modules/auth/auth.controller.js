import {
    registerMember,
    getRegistrationOptions,
    verifyRegistration,
    getAuthenticationOptions,
    verifyAuthentication,
    loginWithPin
} from './auth.service.js'

export const register = async (req, res, next) => {
    try {
        const result = await registerMember(req.body)
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: result
        })
    } catch (err) {
        next(err)
    }
}

export const getWebAuthnRegistrationOptions = async (req, res, next) => {
    try {
        const options = await getRegistrationOptions(req.member.id)
        res.status(200).json({ success: true, data: options })
    } catch (err) {
        next(err)
    }
}

export const verifyWebAuthnRegistration = async (req, res, next) => {

    console.log(req)
    try {
        const result = await verifyRegistration(req.member.id, req.body)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}

export const getWebAuthnLoginOptions = async (req, res, next) => {
    try {
        const options = await getAuthenticationOptions(req.body.email)
        res.status(200).json({ success: true, data: options })
    } catch (err) {
        next(err)
    }
}

export const verifyWebAuthnLogin = async (req, res, next) => {
    try {
        const { email, credential } = req.body
        const result = await verifyAuthentication(email, credential)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}

export const pinLogin = async (req, res, next) => {
    try {
        const { email, pin } = req.body
        const result = await loginWithPin(email, pin)
        res.status(200).json({ success: true, data: result })
    } catch (err) {
        next(err)
    }
}
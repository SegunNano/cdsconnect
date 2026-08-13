import { registerMember, loginMember } from './auth.service.js'

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

export const login = async (req, res, next) => {
    try {
        const { email, pin, device_fingerprint } = req.body
        const result = await loginMember(email, pin, device_fingerprint)
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        })
    } catch (err) {
        next(err)
    }
}
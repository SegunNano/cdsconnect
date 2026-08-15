import {
    getSettings,
    toggleRegistration,
    getRegistrationStatus
} from './settings.service.js'

export const getStatus = async (req, res, next) => {
    try {
        const status = await getRegistrationStatus()
        res.status(200).json({ success: true, data: status })
    } catch (err) {
        next(err)
    }
}

export const toggle = async (req, res, next) => {
    try {
        const settings = await toggleRegistration()
        res.status(200).json({
            success: true,
            message: settings.registration_open
                ? 'Registration is now open'
                : 'Registration is now closed',
            data: settings
        })
    } catch (err) {
        next(err)
    }
}
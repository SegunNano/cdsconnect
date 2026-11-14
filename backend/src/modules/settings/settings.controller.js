import {
    getSettings,
    toggleRegistration,
    getRegistrationStatus,
    getPaymentAccount,
    updatePaymentAccount
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

export const getAccount = async (req, res, next) => {
    try {
        const data = await getPaymentAccount({ includeMeta: !!req.member.is_dev })
        res.set('Cache-Control', 'no-store')   // never let a browser serve an old account
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}

export const updateAccount = async (req, res, next) => {
    try {
        const data = await updatePaymentAccount(req.member.id, req.body)
        res.status(200).json({ success: true, data })
    } catch (err) { next(err) }
}
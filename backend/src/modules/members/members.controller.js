import {
    getMe,
    getAllMembers,
    updateMemberRole,
    toggleDevAccess,
    resetDeviceFingerprint,
    extendServiceYear,
    deactivateMember
} from './members.service.js'

export const getMyProfile = async (req, res, next) => {
    try {
        const member = await getMe(req.member.id)
        res.status(200).json({ success: true, data: member })
    } catch (err) {
        next(err)
    }
}

export const getMembers = async (req, res, next) => {
    try {
        const members = await getAllMembers()
        res.status(200).json({ success: true, data: members })
    } catch (err) {
        next(err)
    }
}

export const updateRole = async (req, res, next) => {
    try {
        const member = await updateMemberRole(req.params.id, req.body.role)
        res.status(200).json({ success: true, data: member })
    } catch (err) {
        next(err)
    }
}

export const toggleDev = async (req, res, next) => {
    try {
        const member = await toggleDevAccess(req.member.id, req.params.id)
        res.status(200).json({ success: true, data: member })
    } catch (err) {
        next(err)
    }
}

export const resetDevice = async (req, res, next) => {
    try {
        const member = await resetDeviceFingerprint(req.params.id)
        res.status(200).json({ success: true, data: member })
    } catch (err) {
        next(err)
    }
}

export const extendService = async (req, res, next) => {
    try {
        const { new_end_date, reason } = req.body
        const member = await extendServiceYear(req.params.id, new_end_date, reason)
        res.status(200).json({ success: true, data: member })
    } catch (err) {
        next(err)
    }
}

export const deactivate = async (req, res, next) => {
    try {
        const member = await deactivateMember(req.params.id)
        res.status(200).json({ success: true, data: member })
    } catch (err) {
        next(err)
    }
}
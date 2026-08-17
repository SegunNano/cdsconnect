import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from './notifications.service.js'

export const getMyList = async (req, res, next) => {
    try {
        const notifications = await getMyNotifications(req.member.id)
        res.status(200).json({ success: true, data: notifications })
    } catch (err) {
        next(err)
    }
}

export const getUnread = async (req, res, next) => {
    try {
        const count = await getUnreadCount(req.member.id)
        res.status(200).json({ success: true, data: { count } })
    } catch (err) {
        next(err)
    }
}

export const readOne = async (req, res, next) => {
    try {
        const notification = await markAsRead(req.member.id, req.params.id)
        res.status(200).json({ success: true, data: notification })
    } catch (err) {
        next(err)
    }
}

export const readAll = async (req, res, next) => {
    try {
        await markAllAsRead(req.member.id)
        res.status(200).json({ success: true, message: 'All notifications marked as read.' })
    } catch (err) {
        next(err)
    }
}
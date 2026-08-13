export default (req, res, next) => {
    if (!req.member.is_dev) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Dev only.'
        })
    }
    next()
}
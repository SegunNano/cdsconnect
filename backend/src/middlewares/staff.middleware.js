export default (req, res, next) => {
    if (req.member.member_type !== 'staff') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Staff only.'
        })
    }
    next()
}
export const requireRole = (...roles) => {
    const allowedRoles = roles.flat().map(r => String(r).trim().toLowerCase())

    return (req, res, next) => {
        const userRole = String(req.member?.role || '').trim().toLowerCase()
        
        
        if (!allowedRoles.includes(userRole)) {
            console.log('Allowed Roles:', allowedRoles, 'User Role:', userRole)
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient role.'
            })
        }
        next()
    }
}
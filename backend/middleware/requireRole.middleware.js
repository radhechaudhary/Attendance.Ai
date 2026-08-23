const requireRole = (role) => (req, res, next) => {
    const userRole = req.user?.role || 'teacher';
    if (userRole !== role) {
        return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient role' });
    }
    next();
};

export default requireRole;

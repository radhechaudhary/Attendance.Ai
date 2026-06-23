const logout = async (req, res) => {
    res.clearCookie('authToken')
    res.json({ message: 'Logout successful' })
}

export default logout
export const auth = async (req, res, next) => {
    try {
        const headerAuthorization = req.headers.authorization;

        

        next()
    } catch (error) {
        res.status(401).json({ message: "Token inválido ou expirado" });
    }
}
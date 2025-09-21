const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const userMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ message: "Authorization header missing or malformed" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, secret, {
            ignoreExpiration: false,
        });

        if (!decoded.userId || !decoded.email) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = {
    userMiddleware,
};

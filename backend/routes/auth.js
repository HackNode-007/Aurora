const {Router} = require("express")
const z = require("zod")
const bcrypt = require("bcrypt")
const {userModel} = require("../db");
const {registerObject, loginObject} = require("../utils/ZodObjects");
const {generateToken} = require("../utils/auth");
const authRouter = new Router()
const saltRounds = parseInt(process.env.SALT_ROUNDS)

authRouter.post('/register', async (req, res) => {
    const { email, password, username, phone } = req.body;

    try {
        const data =  registerObject.parse({
            email, 
            password,
            username, 
            phone 
        });

        const hash = bcrypt.hashSync(password, saltRounds);

        const user = await userModel.findOne({
            $or: [
                { email },
                { username },
                { phone }
            ]
        });

        if (user) {
            return res.status(409).json({
                message: "User with these credentials already exists"
            });
        }

        const response = await userModel.create({
            email,
            password: hash,
            username,
            phone
        });

        return res.status(201).json({
            message: "User registered successfully",
            data: response
        });

    } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid input format",
                error: e.errors
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: e.message
        });
    }
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const data = await loginObject.parse({ email, password });

        const user = await userModel.findOne({
            email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const compareRes = await bcrypt.compare(password, user.password);

        if (!compareRes) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        return res.status(200).json({
            message: "User login successful",
            token: generateToken(user._id, user.email)
        });

    } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid input format",
                error: e.errors
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: e.message
        });
    }
});

module.exports = {
    authRouter: authRouter
}

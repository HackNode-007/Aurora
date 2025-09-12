const jwt = require("jsonwebtoken")
const secret = process.env.JWT_SECRET
const generateToken = (id,email) => {
    return  jwt.sign({
        userId: id,
        email: email
    },secret,{
        expiresIn: "7d"
    })
}

module.exports = {
    generateToken
}

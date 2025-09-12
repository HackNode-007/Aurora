const z = require("zod")

const registerObject = z.object({
    email: z.email(),
    password: z.string().min(6),
    username: z.string(),
    phone: z.number()
})

const loginObject = z.object({
    email: z.email(),
    password: z.string().min(6)
})

module.exports = {
    registerObject,
    loginObject
}

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

const updateUserObject = z.object({
    walletAddress: z.string().optional(),
    location: z.string().optional(),
}).refine(data => {
    const keys = Object.keys(data).filter(key => data[key] !== undefined);
    return keys.length === 1;
}, {
    message: "You must send either walletAddress or location, not both or none.",
});

module.exports = {
    registerObject,
    loginObject,
    updateUserObject
}

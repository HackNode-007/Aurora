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

const createReportSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters")
        .trim(),
    description: z.string()
        .min(1, "Description is required")
        .max(2000, "Description must be less than 2000 characters")
        .trim(),
    labels: z.array(z.string().min(1, "Label cannot be empty"))
        .min(1, "At least one label is required")
        .max(10, "Maximum 10 labels allowed"),
    location: z.string()
        .min(1, "Location is required")
        .max(300, "Location must be less than 300 characters")
        .trim(),
    imageUrls: z.array(z.string().url("Invalid image URL"))
        .min(1, "At least one image is required")
        .max(5, "Maximum 5 images allowed"),
    urgency: z.enum(['low', 'medium', 'high', 'critical'], {
        errorMap: () => ({ message: "Urgency must be one of: low, medium, high, critical" })
    }),
    reward: z.number()
        .positive("Reward must be a positive number")
        .max(999999.99, "Reward cannot exceed 999,999.99")
        .optional()
        .or(z.null())
});

module.exports = {
    registerObject,
    loginObject,
    updateUserObject,
    createReportSchema
}

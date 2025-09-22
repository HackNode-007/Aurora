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

const createResponseSchema = z.object({
    reportId: z
        .string({
            required_error: "Report ID is required",
            invalid_type_error: "Report ID must be a string"
        })
        .min(1, "Report ID cannot be empty")
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format for reportId"),

    userId: z
        .string({
            required_error: "User ID is required",
            invalid_type_error: "User ID must be a string"
        })
        .min(1, "User ID cannot be empty")
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format for userId"),

    response: z
        .string({
            required_error: "Response text is required",
            invalid_type_error: "Response must be a string"
        })
        .min(10, "Response must be at least 10 characters long")
        .max(2000, "Response cannot exceed 2000 characters")
        .trim(),

    imageUrls: z
        .array(
            z.string().url("Each image URL must be a valid URL")
        )
        .min(1, "At least one image URL is required")
        .max(10, "Cannot upload more than 10 images")
        .refine(
            (urls) => urls.every(url => 
                /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)
            ),
            {
                message: "All URLs must point to valid image files (jpg, jpeg, png, gif, webp)"
            }
        )
});

const getMyResponsesQuerySchema = z.object({
    status: z
        .enum(['pending', 'accepted', 'rejected'])
        .optional()
});

module.exports = {
    createResponseSchema,
    updateResponseStatusSchema,
    getMyResponsesQuerySchema
};

module.exports = {
    registerObject,
    loginObject,
    updateUserObject,
    createReportSchema,
    createResponseSchema,
    getMyResponsesQuerySchema
}

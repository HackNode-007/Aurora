"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface RegisterFormData {
    email: string;
    password: string;
    username: string;
    phone: string;
    location: string;
    country: string;
    region: string;
    city: string;
}

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<RegisterFormData>({
        email: "",
        password: "",
        username: "",
        phone: "",
        location: "",
        country: "",
        region: "",
        city: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isDetectingLocation, setIsDetectingLocation] = useState(true);
    const [locationError, setLocationError] = useState("");

    useEffect(() => {
        const detectLocation = async () => {
            try {
                setIsDetectingLocation(true);

                const ipResponse = await axios.get("https://ipapi.co/json/");
                const { city, region, country_name } = ipResponse.data;

                setFormData((prev) => ({
                    ...prev,
                    location: `${city}, ${region}, ${country_name}`,
                    country: country_name,
                    region: region,
                    city: city,
                }));
            } catch (err) {
                setLocationError("Could not detect location");
            } finally {
                setIsDetectingLocation(false);
            }
        };

        detectLocation();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name !== "location") {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.location || formData.location === "Location unavailable") {
            setError("We need your location to complete registration");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            await axios.post("/api/auth/register", formData);

            setSuccessMessage("Registration successful! Redirecting to login...");

            setTimeout(() => {
                router.push("/auth/login"); // ✅ redirect to login page
            }, 2000);
        } catch (err: any) {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        setError("Invalid input format");
                        break;
                    case 409:
                        setError("User already exists");
                        break;
                    case 500:
                        setError("Server error. Please try again later.");
                        break;
                    default:
                        setError("An unexpected error occurred");
                }
            } else {
                setError("Network error. Please check your connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    Create Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join Aurora to access your personalized dashboard
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                            {successMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black"
                            placeholder="Enter your phone number"
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Location{" "}
                            {isDetectingLocation && (
                                <span className="text-xs text-gray-500 ml-2">Detecting...</span>
                            )}
                        </label>
                        <input
                            type="text"
                            name="location"
                            readOnly
                            value={formData.location}
                            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                        {locationError && (
                            <p className="text-xs text-red-600">{locationError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black"
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isDetectingLocation}
                        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isLoading
                            ? "Creating account..."
                            : isDetectingLocation
                                ? "Detecting location..."
                                : "Sign Up"}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => router.push("/auth/login")}
                            className="font-medium text-black hover:text-gray-800"
                        >
                            Sign in
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
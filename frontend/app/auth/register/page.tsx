"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { useLocationDetection } from '@/components/hooks/useLocationDetection';
import {NextError} from "next/dist/lib/is-error";

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

const AuroraRegister: React.FC = () => {
    const router = useRouter();
    const { locationData, isDetecting: isDetectingLocation, error: locationError } = useLocationDetection();

    const [formData, setFormData] = useState<RegisterFormData>({
        email: "",
        password: "",
        username: "",
        phone: "",
        location: "Mohair",
        country: "",
        region: "",
        city: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    useState(() => {
        if (locationData.location) {
            setFormData(prev => ({
                ...prev,
                ...locationData
            }));
        }
    });

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
            console.log("control reach here")
            await axios.post(`${process.env.BASE_URL}/api/auth/register`, formData);
            setSuccessMessage("Registration successful! Redirecting to login...");

            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: NextError) {
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

    const handleLoginRedirect = () => {
        router.push("/auth/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl text-blue-600 font-semibold mb-2">Aurora</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Create Account to access your dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {error && (
                        <div className="text-red-600 text-sm text-center mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="text-green-600 text-sm text-center mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            {successMessage}
                        </div>
                    )}

                    <InputField
                        label="Email"
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        required
                    />

                    <InputField
                        label="Username"
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Choose a username"
                        required
                    />

                    <InputField
                        label="Phone"
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                        required
                    />

                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                Location
                            </label>
                            {isDetectingLocation && (
                                <span className="text-xs text-gray-500">Detecting...</span>
                            )}
                        </div>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-100 cursor-not-allowed text-gray-700 focus:outline-none"
                            placeholder="Location will be detected automatically"
                            readOnly
                        />
                        {locationError && (
                            <p className="text-xs text-red-600 mt-1">{locationError}</p>
                        )}
                    </div>

                    <InputField
                        label="Password"
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Create a password"
                        required
                    />

                    <Button
                        type="submit"
                        disabled={isLoading || isDetectingLocation}
                        isLoading={isLoading}
                        className="bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                        {isLoading
                            ? "Creating account..."
                            : isDetectingLocation
                                ? "Detecting location..."
                                : "Register"}
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={handleLoginRedirect}
                            className="font-medium text-black hover:text-gray-800 hover:underline"
                        >
                            Login
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuroraRegister;
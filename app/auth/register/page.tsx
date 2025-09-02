"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

const RegisterPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState("");

    const validateCredentials = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name.trim()) {
            return "Name is required";
        }
        if (!emailRegex.test(email)) {
            return "Enter a valid email address";
        }
        if (password.length < 6) {
            return "Password must be at least 6 characters";
        }
        return "";
    };

    const handelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const validationError = validateCredentials();
        if (validationError) {
            setError(validationError);
            return;
        }

        setRegistering(true);

        try {
            const response = await axios.post("/api/auth/register", {
                email,
                password,
                name,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log(response.data, "registered successfully")
            router.push("/auth/login")

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Access the error message from the backend response
                const errorMessage = error.response.data.error;
                console.error('Registration failed:', errorMessage);
                setError(errorMessage)
            } else {
                setError("An unexpected error occurred")
            }
        }
        finally {
            setRegistering(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-secondary/95 backdrop-blur-md border border-control-border rounded-2xl p-8 shadow-2xl">
            {/* Logo + Heading */}
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-text">
                    <span className="text-lg font-bold">A</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
                    Welcome to Aurora
                </h1>
                <p className="mt-2 text-sm text-secondary-text">
                    Register to continue to Aurora
                </p>
            </div>

            {/* Google Button */}
            <div>
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 border text-secondary-text border-control-border rounded-lg px-4 py-2 hover:bg-primary transition"
                >
                    <Image
                        src="/icons/google.svg"
                        alt="Google"
                        width={18}
                        height={18}
                    />
                    Continue with Google
                </button>
            </div>

            {/* Divider */}
            <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-control-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-secondary px-2 text-secondary-text">
                        Or continue with
                    </span>
                </div>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handelSubmit}>
                {/* Name */}
                <div className="relative">
                    <input
                        id="name"
                        type="text"
                        placeholder=" "
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="peer w-full h-12 px-3 rounded-lg border border-control-border bg-transparent text-text placeholder-transparent focus:border-text focus:outline-none"
                    />
                    <label
                        htmlFor="name"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-text transition-all bg-secondary px-1
                          peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-secondary-text peer-placeholder-shown:text-sm
                          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-text
                          peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-text"
                    >
                        Name
                    </label>
                </div>

                {/* Email */}
                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full h-12 px-3 rounded-lg border border-control-border bg-transparent text-text placeholder-transparent focus:border-text focus:outline-none"
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-text transition-all bg-secondary px-1
                          peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-secondary-text peer-placeholder-shown:text-sm
                          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-text
                          peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-text"
                    >
                        Email
                    </label>
                </div>

                {/* Password */}
                <div className="relative">
                    <input
                        id="password"
                        type="password"
                        placeholder=" "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full h-12 px-3 rounded-lg border border-control-border bg-transparent text-text placeholder-transparent focus:border-text focus:outline-none"
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-secondary-text transition-all bg-secondary px-1
                          peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-secondary-text peer-placeholder-shown:text-sm
                          peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-text
                          peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-text"
                    >
                        Password
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                {/* Register Button */}
                <button
                    type="submit"
                    disabled={registering}
                    className="w-full h-11 rounded-lg bg-text text-primary font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {registering ? "Registering..." : "Register"}
                </button>
            </form>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-secondary-text">
                Already have an account?{" "}
                <a className="text-text underline underline-offset-4 hover:text-gray-200 transition" href="/auth/login">Login</a>
            </p>
        </div>
    );
};

export default RegisterPage;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";

const mapNextAuthError = (code?: string | null) => {
  switch (code) {
    case "Signin":
    case "OAuthSignin":
      return "Could not start sign-in. Please try again.";
    case "OAuthCallback":
      return "There was a problem completing the sign-in. Please try again.";
    case "OAuthAccountNotLinked":
      return "This email is already registered with a different sign-in method. Try that provider or use password login.";
    case "CredentialsSignin":
      return "Invalid email or password.";
    case "AccessDenied":
      return "Access denied.";
    case "Configuration":
      return "A configuration error occurred. Please contact support.";
    case "Verification":
      return "The verification link is invalid or has expired.";
    default:
      return null;
  }
};

const LoginPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/user/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle NextAuth error codes sent to this page (via pages.error/pages.signIn)
  const queryErrorMessage = useMemo(() => mapNextAuthError(params.get("error")), [params]);
  const signOutFlag = params.get("signout");

  useEffect(() => {
    if (queryErrorMessage) {
      setError(queryErrorMessage);
    }
    if (signOutFlag) {
      setSuccess("You have been logged out successfully.");
    }
  }, [queryErrorMessage, signOutFlag]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });
    setLoading(false);

    if (res?.error) {
      // res.error is usually a code like "CredentialsSignin"
      setError(mapNextAuthError(res.error) || "Sign-in failed. Please try again.");
      return;
    }
    if (res?.url) {
      router.push(res.url);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGoogle = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-md bg-secondary/95 backdrop-blur-md border border-control-border rounded-2xl p-8 shadow-2xl">
      {/* Logo + Heading */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-text">
          <span className="text-lg font-bold">A</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text">
          Welcome back to Aurora
        </h1>
        <p className="mt-2 text-sm text-secondary-text">
          Login to continue to your dashboard
        </p>
      </div>

      {/* Google Button */}
      <div>
        <button onClick={handleGoogle} type="button" className="w-full flex items-center justify-center gap-2 border text-secondary-text border-control-border rounded-lg px-4 py-2 hover:bg-primary transition">
          <Image
            src="/icons/google.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Continue with Google
        </button>
      </div>

      {/* Optional Alerts */}
      {success && (
        <div className="mt-4 text-sm text-green-400 text-center">{success}</div>
      )}
      {error && (
        <div className="mt-2 text-sm text-red-400 text-center">{error}</div>
      )}

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
      <form className="space-y-5" onSubmit={onSubmit}>
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

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-text text-primary font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Register */}
      <p className="mt-6 text-center text-sm text-secondary-text">
        Don’t have an account?{" "}
        <button
          onClick={() => router.push("/auth/register")}
          className="text-text underline underline-offset-4 hover:text-gray-200 transition"
        >
          Register
        </button>
      </p>
    </div>
  );
};

export default LoginPage;

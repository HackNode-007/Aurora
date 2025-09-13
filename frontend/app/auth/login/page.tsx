"use client";
import React, { useState } from "react";

export default function LoginPage() {
    const [Email, setEmail] = useState<string>("");
    const [Password, setPassword] = useState<string>("");
    const [Loading, setLoading] = useState<boolean>(false);
    const [Error, setError] = useState<string | null>(null);
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log(e);
    };
    return (
        <div className="min-h screen bg-white flex item-center justify-center p4 ">
            <div className="w-full max-w-md">
                {/*logo*/}
                <div className="flex justify-center mb-8">
                    <div className="">
                        Aurora
                    </div>
                </div>
            </div>
        </div>
    );
}

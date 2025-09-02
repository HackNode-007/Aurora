"use client";
import React from 'react';
import { signOut } from 'next-auth/react';

const HomePage = () => {
    const handleLogout = async () => {
        // Send the user back to the login page and show a logout confirmation
        await signOut({ callbackUrl: "/auth/login?signout=1" });
    };

    return (
        <div className="p-6 space-y-4">
            <div>Home Page</div>
            <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-md bg-text px-4 py-2 text-primary hover:bg-gray-200 transition"
            >
                Logout
            </button>
        </div>
    );
};

export default HomePage;

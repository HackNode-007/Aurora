"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function LoginButtons() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <p>Loading...</p>
    }

    if (session) {
        return (
            <div className="flex flex-col items-center gap-2">
                <p>Signed in as {session.user?.email}</p>
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Sign out
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={() => signIn("google")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Sign in with Google
            </button>
            <button
                onClick={() =>
                    signIn("credentials", {
                        email: "test@test.com",
                        password: "1234",
                        redirect: false,
                    })
                }
                className="px-4 py-2 bg-gray-700 text-white rounded"
            >
                Sign in with Email
            </button>
        </div>
    )
}

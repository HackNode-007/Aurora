import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/lib/providers";

export const metadata: Metadata = {
    title: "Aurora",
    description:
        "An ai and web-3 powered web-app that helps to report and resolve issue and get rewards on resolving issue listed on our website",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}

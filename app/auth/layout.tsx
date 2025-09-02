export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-primary min-h-screen h-fit w-screen flex justify-center items-center">
            {children}
        </div>
    );
}

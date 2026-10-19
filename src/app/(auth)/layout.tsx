export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="hidden lg:flex flex-col items-center justify-center bg-black relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-secondary/20 blur-[150px] rounded-full mix-blend-screen" />

                <div className="relative z-10 text-center space-y-6 max-w-lg px-8">
                    <h1 className="text-6xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-linear-to-r from-primary via-white to-secondary">
                        ZenFit
                    </h1>
                    <p className="text-2xl text-gray-400 font-light">
                        &ldquo;The only bad workout is the one that didn&apos;t happen.&rdquo;
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center p-8 bg-background">
                {children}
            </div>
        </div>
    )
}

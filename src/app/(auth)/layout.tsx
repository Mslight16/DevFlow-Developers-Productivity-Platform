export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      {/* PNG background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />

      {/* Optional overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[var(--background)]/30" />

      {/* Auth pages */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}

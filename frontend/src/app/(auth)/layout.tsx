import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="mb-6 font-display text-2xl font-bold text-brand">Validly</Link>
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8">{children}</div>
    </main>
  );
}
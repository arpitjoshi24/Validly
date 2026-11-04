import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-ink-soft">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">Go to home</Link>
    </main>
  );
}
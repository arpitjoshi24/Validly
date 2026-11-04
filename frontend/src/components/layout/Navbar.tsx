import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl font-bold text-brand">Validly</Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="rounded-md px-3 py-2 text-ink-soft hover:bg-canvas">Log in</Link>
          <Link href="/register" className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
            Create account
          </Link>
        </nav>
      </div>
    </header>
  );
}
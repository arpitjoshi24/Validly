"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card } from "@/components/ui/Card";
import { categoryLabel, productsApi } from "@/lib/products";
import type { Pagination, Product } from "@/types/campaign";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    productsApi
      .list(page)
      .then((d) => {
        setItems(d.items);
        setPagination(d.pagination);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load products."))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <RoleGuard roles={["FOUNDER"]}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/founder/products/new" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          New product
        </Link>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ink-soft">Loading products...</p>}

      {!loading && !error && items.length === 0 && (
        <Card className="mt-6">
          <h2 className="font-semibold">No products yet</h2>
          <p className="mt-1 text-sm text-ink-soft">Add the product you want to test. You can create campaigns for it afterwards.</p>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link key={p.id} href={`/founder/products/${p.id}`} className="block">
            <Card className="h-full overflow-hidden p-0 hover:border-brand">
              {p.images[0] ? (
                <img src={p.images[0].url} alt={p.name} className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gray-100 text-sm text-ink-soft">
                  No image yet
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold">{p.name}</h2>
                <p className="mt-1 text-sm text-ink-soft">{categoryLabel(p.category)}</p>
                <p className="mt-2 text-sm text-ink-soft">
                  {p.campaignCount ?? 0} campaign{p.campaignCount === 1 ? "" : "s"}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <span className="text-ink-soft">Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      )}
    </RoleGuard>
  );
}
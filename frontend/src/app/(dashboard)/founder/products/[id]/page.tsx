"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card } from "@/components/ui/Card";
import { ImageManager } from "@/components/products/ImageManager";
import { ProductForm } from "@/components/products/ProductForm";
import { categoryLabel, productsApi } from "@/lib/products";
import type { Product, ProductImage } from "@/types/campaign";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productsApi
      .get(id)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load this product."));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this product and its images? This can't be undone.")) return;
    setDeleting(true);
    setError(null);
    try {
      await productsApi.remove(id);
      router.push("/founder/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete this product.");
      setDeleting(false);
    }
  }

  const setImages = (images: ProductImage[]) => setProduct((p) => (p ? { ...p, images } : p));

  return (
    <RoleGuard roles={["FOUNDER"]}>
      <Link href="/founder/products" className="text-sm text-ink-soft hover:underline">Back to products</Link>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {!product && !error && <p className="mt-4 text-sm text-ink-soft">Loading...</p>}

      {product && (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="mt-1 text-sm text-ink-soft">{categoryLabel(product.category)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/founder/campaigns/new"
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
                Create campaign
              </Link>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                  Edit details
                </button>
              )}
              <button onClick={handleDelete} disabled={deleting}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {editing ? (
            <div className="mt-6">
              <ProductForm
                initial={product}
                submitLabel="Save changes"
                onCancel={() => setEditing(false)}
                onSubmit={async (values) => {
                  const updated = await productsApi.update(id, values);
                  setProduct(updated);
                  setEditing(false);
                }}
              />
            </div>
          ) : (
            <Card className="mt-6">
              <h2 className="font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm">{product.description}</p>
              <p className="mt-4 text-sm text-ink-soft">
                {product.campaignCount ?? 0} campaign{product.campaignCount === 1 ? "" : "s"} for this product
              </p>
            </Card>
          )}

          <ImageManager productId={id} images={product.images} onChange={setImages} />
        </>
      )}
    </RoleGuard>
  );
}
"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ALLOWED_TYPES, MAX_FILE_BYTES, MAX_IMAGES, productsApi } from "@/lib/products";
import type { ProductImage } from "@/types/campaign";

type Props = {
  productId: string;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
};

export function ImageManager({ productId, images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // lets the same file be picked again
    if (files.length === 0) return;
    setError(null);

    const room = MAX_IMAGES - images.length;
    if (room <= 0) return setError(`This product already has ${MAX_IMAGES} images.`);
    if (files.length > room) return setError(`You can add ${room} more image${room === 1 ? "" : "s"}.`);

    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) return setError(`${f.name}: use a JPG, PNG or WebP image.`);
      if (f.size > MAX_FILE_BYTES) return setError(`${f.name}: image must be smaller than 5 MB.`);
    }

    setBusy(true);
    let current = images;
    try {
      for (const f of files) {
        const img = await productsApi.uploadImage(productId, f);
        current = [...current, img];
        onChange(current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(imageId: string) {
    if (!confirm("Remove this image?")) return;
    setError(null);
    try {
      await productsApi.removeImage(productId, imageId);
      onChange(images.filter((i) => i.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the image. Try again.");
    }
  }

  return (
    <Card className="mt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Images ({images.length}/{MAX_IMAGES})</h2>
          <p className="text-sm text-ink-soft">JPG, PNG or WebP, up to 5 MB each. You need at least one to publish a campaign.</p>
        </div>
        <button type="button" disabled={busy || images.length >= MAX_IMAGES} onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
          {busy ? "Uploading..." : "Add images"}
        </button>
        <input ref={inputRef} type="file" accept={ALLOWED_TYPES.join(",")} multiple hidden onChange={handleFiles} />
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      {images.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No images yet. Add a clear photo of your product.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {images.map((img, i) => (
            <li key={img.id} className="group relative overflow-hidden rounded-md border border-gray-200">
              {/* plain <img> so you don't have to configure next/image remote domains */}
              <img src={img.url} alt={`Product image ${i + 1}`} className="aspect-square w-full object-cover" />
              <button type="button" onClick={() => handleRemove(img.id)} aria-label={`Remove image ${i + 1}`}
                className="absolute right-1 top-1 rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-white">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
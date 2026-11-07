import { api, pick } from "@/lib/api";
import type { Pagination, Product, ProductImage } from "@/types/campaign";

export const CATEGORIES = [
  { value: "FOOD_BEVERAGE", label: "Food & beverage" },
  { value: "FASHION", label: "Fashion" },
  { value: "BEAUTY", label: "Beauty" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "HOME_LIVING", label: "Home & living" },
  { value: "HEALTH_WELLNESS", label: "Health & wellness" },
  { value: "TOYS_KIDS", label: "Toys & kids" },
  { value: "OTHER", label: "Other" },
] as const;

export const categoryLabel = (value: string) => CATEGORIES.find((c) => c.value === value)?.label ?? value;

export const MAX_IMAGES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProductInput = { name: string; description: string; category: string };

export const productsApi = {
  list(page = 1, limit = 12) {
    return api.get<{ items: Product[]; pagination: Pagination }>(`/products?page=${page}&limit=${limit}`);
  },
  async get(id: string) {
    return pick<Product>(await api.get<unknown>(`/products/${id}`), "product");
  },
  async create(body: ProductInput) {
    return pick<Product>(await api.post<unknown>("/products", body), "product");
  },
  async update(id: string, body: Partial<ProductInput>) {
    return pick<Product>(await api.patch<unknown>(`/products/${id}`, body), "product");
  },
  remove(id: string) {
    return api.delete<unknown>(`/products/${id}`);
  },

  // 3 steps: ask backend for a signed URL, PUT the file to storage, then register it.
  async uploadImage(productId: string, file: File) {
    const { uploadUrl, key } = await api.post<{ uploadUrl: string; key: string }>(
      `/products/${productId}/images/upload-url`,
      { contentType: file.type, fileSize: file.size }
    );

    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) throw new Error("Image upload failed. Check your storage settings and try again.");

    return pick<ProductImage>(await api.post<unknown>(`/products/${productId}/images`, { key }), "image");
  },
  removeImage(productId: string, imageId: string) {
    return api.delete<unknown>(`/products/${productId}/images/${imageId}`);
  },
};
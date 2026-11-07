"use client";

import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ProductForm } from "@/components/products/ProductForm";
import { productsApi } from "@/lib/products";

export default function NewProductPage() {
  const router = useRouter();
  return (
    <RoleGuard roles={["FOUNDER"]}>
      <h1 className="text-3xl font-bold">New product</h1>
      <p className="mb-6 mt-2 text-ink-soft">Add the basics first. You'll upload images on the next screen.</p>
      <ProductForm
        submitLabel="Create product"
        onSubmit={async (values) => {
          const product = await productsApi.create(values);
          router.push(`/founder/products/${product.id}`);
        }}
      />
    </RoleGuard>
  );
}
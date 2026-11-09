"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import type { VerificationStatus } from "@/types";
import { foundersApi } from "./founders.api";
import { VerificationBadge } from "./VerificationBadge";

const schema = z.object({
  businessName: z.string().min(2, "Enter your business name"),
  category: z.string().min(2, "Enter a product category, such as snacks"),
  website: z.string().url("Enter a full URL, like https://example.com").or(z.literal("")),
  description: z.string().max(500, "Keep it under 500 characters"),
});
type Values = z.infer<typeof schema>;

export function FounderProfileForm() {
  const [status, setStatus] = useState<VerificationStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { businessName: "", category: "", website: "", description: "" },
  });

  useEffect(() => {
    foundersApi
      .getMine()
      .then(({ verificationStatus, ...rest }) => {
        setStatus(verificationStatus);
        reset({ businessName: rest.businessName ?? "", category: rest.category ?? "", website: rest.website ?? "", description: rest.description ?? "" });
      })
      .catch(() => { /* no profile yet: show an empty form */ })
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(values: Values) {
    try {
      const saved = await foundersApi.updateMine(values);
      setStatus(saved.verificationStatus);
      toast.success("Business profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    }
  }

  if (loading) return <Spinner className="mx-auto mt-16 size-6 text-brand" />;

  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Business details</h2>
        <VerificationBadge status={status} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4" noValidate>
        <Input label="Business name" error={errors.businessName?.message} {...register("businessName")} />
        <Input label="Product category" error={errors.category?.message} {...register("category")} />
        <Input label="Website (optional)" type="url" placeholder="https://" error={errors.website?.message} {...register("website")} />
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium">About your business</label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm"
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
        </div>
        <Button type="submit" loading={isSubmitting} className="text-black">Save profile</Button>
      </form>
    </Card>
  );
}
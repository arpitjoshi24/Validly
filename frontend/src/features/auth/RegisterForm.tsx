"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { authApi } from "./auth.api";
import { registerSchema, type RegisterValues } from "./auth.schema";

const ROLES = [
  { value: "FOUNDER", title: "I have a product idea", body: "Publish a concept and measure real demand." },
  { value: "CONSUMER", title: "I want to give feedback", body: "Vote on new products. It's always free." },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "FOUNDER" },
  });
  const role = watch("role");

  async function onSubmit(values: RegisterValues) {
    try {
      const user = await authApi.register(values);
      setUser(user);
      toast.success("Account created");
      router.replace(ROLE_HOME[user.role]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create your account");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-sm font-medium">How will you use Validly?</legend>
        {ROLES.map((r) => (
          <label
            key={r.value}
            className={cn(
              "cursor-pointer rounded-md border p-3 text-sm",
              role === r.value ? "border-brand bg-brand-tint" : "border-line bg-surface hover:bg-canvas"
            )}
          >
            <input type="radio" value={r.value} className="sr-only" {...register("role")} />
            <span className="block font-medium">{r.title}</span>
            <span className="text-ink-soft">{r.body}</span>
          </label>
        ))}
      </fieldset>
      <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with a letter and a number"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">Create account</Button>
      <p className="text-center text-sm text-ink-soft">
        Already have an account? <Link href="/login" className="font-medium text-brand">Log in</Link>
      </p>
    </form>
  );
}
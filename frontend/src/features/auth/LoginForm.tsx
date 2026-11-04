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
import { authApi } from "./auth.api";
import { loginSchema, type LoginValues } from "./auth.schema";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    try {
      const user = await authApi.login(values);
      setUser(user);
      router.replace(ROLE_HOME[user.role]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not log in");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
      <Button type="submit" loading={isSubmitting} className="w-full">Log in</Button>
      <p className="text-center text-sm text-ink-soft">
        New to Validly? <Link href="/register" className="font-medium text-brand">Create an account</Link>
      </p>
    </form>
  );
}
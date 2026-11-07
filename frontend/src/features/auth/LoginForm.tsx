
"use client";

import { useState } from "react";
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
import type { Role } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setServerError("");

    try {
      // Authenticate user
      const user = await authApi.login(values);

      // Validate API response
      if (!user || !user.id || !user.role) {
        throw new Error(
          "Invalid login response. Please check your authentication API."
        );
      }

      // Validate user role
      const role = user.role as Role;

      if (!Object.prototype.hasOwnProperty.call(ROLE_HOME, role)) {
        throw new Error(`Unsupported account role: ${user.role}`);
      }

      // Store authenticated user
      setUser(user);

      // Get role-based dashboard
      const destination = ROLE_HOME[role];

      console.log("Login successful:", {
        email: user.email,
        role: user.role,
        destination,
      });

      toast.success("Login successful!");

      // Navigate to dashboard
      router.replace(destination);

      router.refresh();

    } catch (error) {
      console.error("Login failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      {/* Password */}
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      {/* Server Error */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Signing in..." : "Log in"}
      </Button>

      {/* Register */}
      <p className="text-center text-sm text-ink-soft">
        New to Validly?{" "}
        <Link
          href="/register"
          className="font-medium text-brand hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

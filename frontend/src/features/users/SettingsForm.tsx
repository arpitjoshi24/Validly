"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "./users.api";

const nameSchema = z.object({ name: z.string().min(2, "Enter your full name") });
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

type NameValues = z.infer<typeof nameSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function SettingsForm() {
  const { user, setUser } = useAuth();

  const nameForm = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: user?.name ?? "" } });
  const passForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  async function saveName({ name }: NameValues) {
    try {
      setUser(await usersApi.updateName(name));
      toast.success("Name saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your name");
    }
  }

  async function savePassword(v: PasswordValues) {
    try {
      await usersApi.changePassword(v.currentPassword, v.newPassword);
      passForm.reset();
      toast.success("Password changed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change your password");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Your name</h2>
        <form onSubmit={nameForm.handleSubmit(saveName)} className="max-w-md space-y-4" noValidate>
          <Input label="Full name" error={nameForm.formState.errors.name?.message} {...nameForm.register("name")} />
          <Input label="Email" value={user?.email ?? ""} disabled readOnly hint="Email can't be changed" />
          <Button type="submit" loading={nameForm.formState.isSubmitting}>Save name</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Password</h2>
        <form onSubmit={passForm.handleSubmit(savePassword)} className="max-w-md space-y-4" noValidate>
          <Input label="Current password" type="password" autoComplete="current-password" error={passForm.formState.errors.currentPassword?.message} {...passForm.register("currentPassword")} />
          <Input label="New password" type="password" autoComplete="new-password" error={passForm.formState.errors.newPassword?.message} {...passForm.register("newPassword")} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" error={passForm.formState.errors.confirm?.message} {...passForm.register("confirm")} />
          <Button type="submit" loading={passForm.formState.isSubmitting}>Change password</Button>
        </form>
      </Card>
    </div>
  );
}
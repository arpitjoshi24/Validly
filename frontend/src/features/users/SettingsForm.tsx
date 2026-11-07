"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "./users.api";

// Limits match users.schema.js on the backend
const nameSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Use 80 characters or fewer"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters").max(72, "Use 72 characters or fewer"),
    confirm: z.string().min(1, "Re-enter your new password"),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Passwords don't match" })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password you haven't used here",
  });

type NameValues = z.infer<typeof nameSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function SettingsForm() {
  const { user, setUser } = useAuth();

  const nameForm = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? "" },
  });
  const passForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  async function saveName({ name }: NameValues) {
    if (name === user?.name) {
      toast.info("That's already your name");
      return;
    }
    try {
      const updated = await usersApi.updateName(name);
      setUser(updated);
      nameForm.reset({ name: updated.name });
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
      const message = err instanceof Error ? err.message : "Could not change your password";
      // The backend answers a wrong current password with 401 and this message
      if (/current password/i.test(message)) {
        passForm.setError("currentPassword", { message: "That isn't your current password" });
      } else {
        toast.error(message);
      }
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
          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            error={passForm.formState.errors.currentPassword?.message}
            {...passForm.register("currentPassword")}
          />
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            hint="At least 8 characters"
            error={passForm.formState.errors.newPassword?.message}
            {...passForm.register("newPassword")}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            error={passForm.formState.errors.confirm?.message}
            {...passForm.register("confirm")}
          />
          <Button type="submit" loading={passForm.formState.isSubmitting}>Change password</Button>
        </form>
      </Card>
    </div>
  );
}
"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { FounderProfileForm } from "@/features/founders/FounderProfileForm";

export default function FounderProfilePage() {
  return (
    <RoleGuard roles={["FOUNDER"]}>
      <h1 className="mb-6 text-3xl font-bold">Business profile</h1>
      <FounderProfileForm />
    </RoleGuard>
  );
}
"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { ConsumerProfileForm } from "@/features/consumers/ConsumerProfileForm";

export default function ConsumerProfilePage() {
  return (
    <RoleGuard roles={["CONSUMER"]}>
      <h1 className="mb-6 text-3xl font-bold">Interests</h1>
      <ConsumerProfileForm />
    </RoleGuard>
  );
}
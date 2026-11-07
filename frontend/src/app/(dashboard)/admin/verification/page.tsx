"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { BusinessVerification } from "@/features/admin/BusinessVerification";

export default function BusinessVerificationPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <PageHeader
        title="Business verification"
        description="Only verified founders can publish validation campaigns. Review each business before approving it."
      />
      <BusinessVerification />
    </RoleGuard>
  );
}
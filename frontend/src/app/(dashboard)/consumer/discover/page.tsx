"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { DiscoverFeed } from "@/features/discovery/DiscoverFeed";

export default function DiscoverPage() {
  return (
    <RoleGuard roles={["CONSUMER"]}>
      <PageHeader
        title="Discover"
        description="Products founders are testing right now. Your feedback decides what gets made."
      />
      <DiscoverFeed />
    </RoleGuard>
  );
}